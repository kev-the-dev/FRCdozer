var express = require('express');
var router = express.Router();
var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var crypto = require('crypto');
var passport = require('passport');
var passportLocal = require('passport-local');
var games = con.model ('FRCgames', new sch({
  name: {type:String,unique:true},
  description: String,
  game: [new sch({name:String,type:String})],
  calc: [{name:String,elements:[{name:String,worth:Number}]}],
  submissions: [new sch({
    match: String,
    team: Number,
    elements: Object
  })]
}));
var users = con.model('users', new sch({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  salt:String,
  info:Object
}));
passport.use(new passportLocal.Strategy(function(name,pass,done) {
  users.findOne({username:name}, function (err,x) {
    if (err) done(err,null);
    else if (x) {
      crypto.pbkdf2(pass,x.salt, 10000, 64, function(err, derivedKey) {
        if (err) done(err,null);
        else {
          if (derivedKey.toString('base64')===x.password.toString('base64')) {
            done(null,{_id:x._id,username:x.username,info:x.info});
          }
          else done(null,null);
        }
      });
    }
    else done(null,null);
  });
}));
passport.serializeUser(function (user,done) {
  if (user._id) done(null,user._id);
  else done(null,null);
});
passport.deserializeUser(function (id,done) {
  users.findById(id, function (err,x) {
    if (err) done (null,null);
    else done(null,x);
  })
});
router.post('/login',passport.authenticate('local'),function (req,res) {
  res.send(req.user);
});
router.post('/logout', function (req,res) {
  req.logout();
  res.send('You have logged out');
});
router.post('/register', function (req,res) {
  var user = req.body.username;
  var pass = req.body.password;
  if (user && pass) {
    crypto.randomBytes(32, function(ex,buf) { //generates salt
      if (ex) res.status(500).send("random bytes crypto error");
      else {
        var salt = buf.toString('base64');
        crypto.pbkdf2(pass, salt, 10000, 64, function(err, derivedKey) {
          if (err) res.status(500).send ("pdkdf2 crypto error");
          else users.create({username:user,password:derivedKey.toString('base64'),salt:salt}, function (err,x) {
            if (err) res.status(500).send (err);
            else res.send('User created: '+x.username);
          });
        });
      }
    });
  }
  else res.status(500).send('No username or password');
});
router.get('/hello', function (req,res) {
  if (req.user) res.send (req.user);
  else res.status(500).send("Not logged in");
})
router.route('/game/:id/sub/:s')
  .get(function (req,res) { //gets match with given id
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        var m = x.submissions.id(req.params.s);
        if (m) res.send (m);
        else res.status(500).send("Error: no matched submission");
      }
    });
  })
  .put(function (req,res) { //edit one match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        var y = x.submissions.id(req.params.s);
        if (y) {
          y.set(req.body);
          x.save(function (err) {
            if (err) res.status(500).send(err);
            else res.send(y);
          });
        }
        else res.status(500).send('Error: submission not found');
      }
    });
  })
  .delete(function (req,res) {
    games.findById(req.params.id,function(err,z) {
      if (err) res.status(500).send(err);
      else if (z) {
        var y = z.submissions.id(req.params.s);
        if (y) {
          y.remove();
          z.save (function (err) {
            if (err) res.status(500).send (err);
            else res.send("Removed: "+y._id);
          });
        }
        else res.status(500).send('Error: submission not found');
      }
    });
  });

router.route('/game/:id/sub')
  .get(function (req,res) {
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x.submissions);
    });
  })
  .post(function (req,res) { //add match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        y = x.submissions.push(req.body);
        console.log(y);
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else res.send(x.submissions[y-1]);
        });
      }
    });
  });

router.route('/game/:id')
  .get(function (req,res) { //get game with givin id,
    games.findOne({$or : [{_id: req.params.id}, {name: req.params.id}]}, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .put(function (req,res) { //edit game with id
    games.findByIdAndUpdate(req.params.id,{$set:req.body||null},function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .delete(function (req,res) { //delete game with id
    games.findByIdAndRemove(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });

router.route('/game')
  .post(function (req,res) {
    req.body.submissions=[];
    games.create(req.body,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .get(function (req,res) {
    games.find({}, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });

module.exports = router;

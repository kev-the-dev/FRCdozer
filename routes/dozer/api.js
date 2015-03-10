var express = require('express');
var router = express.Router();
var http = require('http');
var multer  = require('multer');
var vars = require('./vars.js'),
    games = vars.games,
    io = vars.io.of('/game');
router.use(require('./auth.js'));

router.param('game', function (req,res,next,id) {
  games.findById(id, function (err,game) {
    if (err) {
      if (err.name === "CastError" && err.type === "ObjectId") games.findOne({name:id}, function (err2,game2) {
        if (err2) next(err2)
        else if (!game2) next(new Error("Game not found"))
        else {
          req.game = game2;
          if (req.user) req.authlevel = (game2.permissions.users || {})[req.user.username] || game2.permissions.others;
          else req.authlevel = game2.permissions.others;
          next();
        }
      });
      else next(err);
    }
    else if (!game) next(new Error("Game not found"));
    else {
      req.game = game;
      if (req.user) req.authlevel = (game.permissions.users || {})[req.user.username] || game.permissions.others;
      else req.authlevel = game.permissions.others;
      next();
    }
  });
});
router.param('team', function (req,res,next,id) {
  if (!req.game) return next(new Error("No game"));

  var t = req.game.teams.id(id);
  if (!t) return next(new Error("Team not found"));

  req.team = t;
  next();
});

router.route('/game/:game/team/:team')
  .get(function (req,res) { //gets match with given id
    if (req.authlevel < 1) return res.status(401).end();
    res.send(req.team);
  })
  .put(function (req,res) { //edit one match
    if (req.authlevel < 2) return res.status(401).end();
    req.team.set(req.body)
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      res.send(req.team);
      io.to(req.game.name).emit('editTeam',req.team);
    });
  })
  .delete(function (req,res) {
    if (req.authlevel < 2) return res.status(401).end();
    req.team.remove();
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      io.to(req.game.name).emit('delTeam',req.team);
      res.end();
    });
  });

router.post('/game/:game/team/:team/pic',[function (req,res,next) {
  if (req.authlevel < 2) return res.status(401).end();
  next();
},multer({limits:{files:1},dest: './public/uploads/', rename: function (fieldname, filename, req, res) {
  return req.team._id;
}}),function (req,res) {
  req.team.pic = req.files.pic.path.slice(7);
  req.game.save(function (err) {
    if (err) res.status(500).send("Error saving game");
    else res.send(req.team.pic);
  });
}]);

router.route('/game/:game/team')
  .get(function (req,res) {
    if (req.authlevel < 1) return res.status(401).end();
    res.send(req.game.teams);
  })
  .delete(function (req,res) {
    if (req.authlevel < 2) return res.status(401).end();
    req.game.set({teams:{}});
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      res.send({teams:req.game.teams});
      io.to(req.game.name).emit('resetTeams',true);
    });
  })
  .post(function (req,res) { //add match
    if (req.authLevel < 2) return res.status(401).end();
    req.game.teams.push(req.body);
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      res.send(req.body);
    });
  });

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
            else {
              res.send(y)
              io.to(x.name).emit('editSub',y);
            };
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
            else {
              io.to(z.name).emit('delSub',y);
              res.send("Removed: "+y._id)
            };
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
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else {
            io.to(x.name).emit('newSub',x.submissions[y-1]);
            res.send(x.submissions[y-1])
          };
        });
      }
    });
  });

router.route('/game/:game')
  .get(function(req,res) {
    if (req.authlevel < 1) res.status(401).send("Not authorized");
    else res.send(req.game);
  })
  .put(function (req,res) {
    if (req.authlevel < 3) return res.status(401).end();
    if (req.authlevel < 4 && req.body.permissions) delete req.body.permissions;
    req.game.set(req.body);
    req.game.save(function (err,x) {
      if (err) res.status(500).send(err);
      else {
        io.to(x.name).emit('editGame',x);
        res.send(x);
      }
    })
  })
  .delete(function (req,res) {
    if (req.authlevel < 4) return res.status(401).end();
    req.game.remove(function (err) {
      if (err) res.status(500).send(err);
      else res.end();
    })
  });

router.post('/game',function (req,res) {
  if (!req.user) return res.status(401).send("Need to be logged in to create game");
  req.body.permissions = req.body.permissions || {}
  req.body.permissions.others = req.body.permissions.others || 1;
  req.body.permissions.users = req.body.permissions.users || {};
  req.body.permissions.users[req.user.username] = 4;
  req.body.submissions=[];
  req.body.teams=[];
  games.create(req.body,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});

router.post('/game/:id/TBAhook', function (req,res) { //Respond to webhook requests from TBA
  games.findById(req.params.id,function(err,x) {
    if (err || !x) res.status(500).send(err);
    else {
      req.body = JSON.parse(Object.keys(req.body)[0]);
      switch (req.body.message_type) {
        case "match_score":
          io.to(x.name).emit("editMatch",req.body);
          res.end();
          break;
        case "verification" :
          x.verification = (req.body.message_data || {}).verification_key || undefined;
          x.save(function (err) {
            if (!err) {
              res.end();
              io.to(x.name).emit('TBAverification',x.verification);
            } else res.end();
          });
          break;
        case "ping" :
          io.to(x.name).emit("TBAping","Ping!");
          res.end();
          break;
        default:
          res.end();
      }
    }
  });
});

router.get('/tbaproxy*', function(req,res) {
  http.get('http://www.thebluealliance.com/api/v2'+req.url.slice(9), function (tba) {
    var str = "";
    tba.on('data',function (x) {
      res.write(x);
    });
    tba.on('end', function() {
      res.end();
    });
  });
});

module.exports = router;

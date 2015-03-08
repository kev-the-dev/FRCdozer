var express = require('express');
var router = express.Router();
var http = require('http');
var vars = require('./vars.js'),
    games = vars.games,
    io = vars.io.of('/game');
router.use(require('./auth.js'));

router.param('game', function (req,res,next,id) {
  console.log(req.user);
  games.findById(id, function (err,game) {
    if (err) {
      if (err.name === "CastError" && err.type === "ObjectId") games.findOne({name:id}, function (err2,game2) {
        if (err2) next(err2)
        else if (!game2) next(new Error("Game not found"))
        else {
          req.game = game2;
          if (req.user) req.authlevel = game2.permissions.users[req.user.username];
          else req.authlevel = game2.permissions.others;
          next();
        }
      });
      else next(err);
    }
    else if (!game) next(new Error("Game not found"));
    else {
      req.game = game;
      if (req.user) req.authlevel = game.permissions.users[req.user.username];
      else req.authlevel = game.permissions.others;
      next();
    }
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

router.route('/game/:id/team/:s')
  .get(function (req,res) { //gets match with given id
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        var m = x.teams.id(req.params.s);
        if (m) res.send (m);
        else res.status(500).send("Error: no matched team");
      }
    });
  })
  .put(function (req,res) { //edit one match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        var y = x.teams.id(req.params.s);
        if (y) {
          y.set(req.body);
          x.save(function (err) {
            if (err) res.status(500).send(err);
            else {
              res.send(y)
              io.to(x.name).emit('editTeam',y);
            };
          });
        }
        else res.status(500).send('Error: team not found');
      }
    });
  })
  .delete(function (req,res) {
    games.findById(req.params.id,function(err,z) {
      if (err) res.status(500).send(err);
      else if (z) {
        var y = z.teams.id(req.params.s);
        if (y) {
          y.remove();
          z.save (function (err) {
            if (err) res.status(500).send (err);
            else {
              io.to(z.name).emit('delTeam',y);
              res.send("Removed: "+y._id)
            };
          });
        }
        else res.status(500).send('Error: team not found');
      }
    });
  });

router.route('/game/:id/team')
  .get(function (req,res) {
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x.teams);
    });
  })
  .delete(function (req,res) {
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        x.teams = {};
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else res.end();
        })
      }
    });
  })
  .post(function (req,res) { //add match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        y = x.teams.push(req.body);
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else {
            io.to(x.name).emit('newTeam',x.teams[y-1]);
            res.send(x.teams[y-1])
          };
        });
      }
    });
  });

router.route('/game/:game')
  .get(function(req,res) {
    console.log(req.game.permissions);
    console.log(req.authlevel);
    if (req.authlevel >= 1) res.send(req.game);
    else res.status(401).send("Not authorized");
  });

router.route('/game/:id')
  .put(function (req,res) { //edit game with id
    games.findByIdAndUpdate(req.params.id,{$set:req.body||null},function(err,x) {
      if (err) res.status(500).send(err);
      else {
        io.to(x.name).emit('editGame',x);
        res.send(x);
      };
    });
  })
  .delete(function (req,res) { //delete game with id
    games.findByIdAndRemove(req.params.id,function(err,x) {
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

router.get('/TBAproxy/:path', function (req,res) { //Proxies request to TBA
  console.log(req.params.path);
  http.get("http://www.thebluealliance.com/api/v2/"+req.params.path, function(x) {
    res.send(x);
  }).on('error', function(err) {
    res.status(500).send(err);
  });
});


router.route('/game')
  .post(function (req,res) {
    req.body.submissions=[];
    games.create(req.body,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });
module.exports = router;

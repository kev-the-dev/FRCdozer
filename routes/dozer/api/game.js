var express = require('express');
var router = express.Router();
var vars = require('./../vars.js'),
  io = vars.io.of('/game');
  games = vars.games;

router.param('game', function (req,res,next,id) {
  games.findById(id, function (err,game) {
    if (err) {
      if (err.name === "CastError" && err.type === "ObjectId") games.findOne({name:id}, function (err2,game2) {
        if (err2) next(err2);
        else if (!game2) next(new Error("Game not found"));
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

router.use('/:game/sub',require('./subs.js'));
router.use('/:game/team',require('./team.js'));


router.route('/:game')
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
    });
  })
  .delete(function (req,res) {
    if (req.authlevel < 4) return res.status(401).end();
    req.game.remove(function (err,x) {
      if (err) res.status(500).send(err);
      else res.end();
    });
  });

router.post('/',function (req,res) {
  if (!req.user) return res.status(401).send("Need to be logged in to create game");

  req.body.permissions = req.body.permissions || {};
  req.body.permissions.others = req.body.permissions.others || 1;
  req.body.permissions.users = req.body.permissions.users || {};
  req.body.permissions.users[req.user.username] = 4;
  req.body.submissions=[];
  req.body.teams=[];
  games.create(req.body,function(err,x) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      req.user.games.push(x);
      req.user.save(function (err,y) {
        if (err) return res.status(500).send(err);
        res.send(x);
      });
    }
  });
});

router.post('/:game/TBAhook', function (req,res) { //Respond to webhook requests from TBA
  req.body = JSON.parse(Object.keys(req.body)[0]);
  switch (req.body.message_type) {
    case "match_score":
      io.to(req.game.name).emit("editMatch",req.body);
      res.end();
      break;
    case "upcoming_match":
      io.to(req.game.name).emit('upcomingMatch',req.body);
      res.end();
      break;
    case "verification" :
      req.game.verification = (req.body.message_data || {}).verification_key || undefined;
      req.game.save(function (err) {
        if (!err) {
          res.end();
          io.to(req.game.name).emit('TBAverification',req.game.verification);
        } else res.end();
      });
      break;
    case "ping" :
      io.to(req.game.name).emit("TBAping",req.body.message_data);
      res.end();
      break;
    default:
      res.end();
  }
});

module.exports = router;

var express = require('express');
var router = express.Router();
var vars = require('./../vars.js'),
  io = vars.io.of('/game');
  games = vars.games;


function findGame(req,res,next,id) {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    games.findById(id, function (err, game) {
      if (err) next(err);
      else if (!game) next("No game found with id "+id);
      else {
        req.game = game;
        if (req.user) req.authlevel = (game.permissions.users || {})[req.user.username];
        else req.authlevel = game.permissions.others;
        next();
      }
    });
  } else { //treat id as name;
    games.findOne({name:id}, function (err,game) {
      if (err) next(err);
      else if (!game) next("No game found with id "+id);
      else {
        req.game = game;
        if (req.user) req.authlevel = (game.permissions.users || {})[req.user.username];
        else req.authlevel = game.permissions.others;
        next();
      }
    });
  }
}

function removeProtected (game,level) {
    if (level<4) {
      delete game.tba.verification_key;
      delete game.tba.key;
    }
    return game;
}

router.param('game',findGame);

router.use('/:game/sub',require('./subs.js'));
router.use('/:game/team',require('./team.js'));
router.use('/:game/tba',require('./tba.js'));

router.route('/:game')
  .get(function(req,res) {
    if (req.authlevel<1) return res.status(401).end();
    res.send(removeProtected(req.game,req.authlevel));
  })
  .put(function (req,res) {
    if (req.authlevel < 3) return res.status(401).end();
    if (req.authlevel < 4 && req.body.permissions) delete req.body.permissions;
    if (req.authlevel < 4 && req.body.tba) delete req.body.tba;

    req.game.set(req.body);
    req.game.save(function (err,x) {
      if (err) res.status(500).send(err);
      else {
        io.to(x.name).emit('editGame',removeProtected(x,req.authlevel));
        res.send(removeProtected(x,req.authlevel));
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

module.exports = router;

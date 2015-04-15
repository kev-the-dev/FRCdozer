var express = require('express');
var router = express.Router();
var multer  = require('multer');
var vars = require('./../vars.js'),
  io = vars.io.of('/game');
  uploadsDir = vars.uploadsDir;

router.param('team', function (req,res,next,id) {
  if (!req.game) return next(new Error("No game"));

  var t = req.game.teams.id(id);
  if (!t) return next(new Error("Team not found"));

  req.team = t;
  next();
});

router.route('/:team')
  .get(function (req,res) { //gets match with given id
    if (req.authlevel < 1) return res.status(401).end();
    res.send(req.team);
  })
  .put(function (req,res) { //edit one match
    if (req.authlevel < 2) return res.status(401).end();
    req.team.set(req.body);
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

router.route('/:team/pic')
  .post([function (req,res,next) {
    if (req.authlevel < 2) return res.status(401).end();
    next();
  },multer({limits:{files:1},dest: uploadsDir, rename: function (fieldname, filename, req, res) {
    return req.team._id;
  }}),function (req,res) {
    req.team.pic = '/uploads/' + req.files.pic.name;
    req.game.save(function (err) {
      if (err) res.status(500).send("Error saving game");
      else {
        io.to(req.game.name).emit('editTeam',req.team);
        res.send(req.team.pic);
      }
    });
  }]);

router.route('/')
  .get(function (req,res) {
    if (req.authlevel < 1) return res.status(401).end();
    res.send(req.game.teams);
  })
  .delete(function (req,res) {
    if (req.authlevel < 3) return res.status(401).end();
    req.game.teams = [];
    req.game.save(function (err,x) {
      if (err) return res.status(500).send(err);
      res.send(x.teams);
      io.to(req.game.name).emit('resetTeams',[]);
    });
  })
  .post(function (req,res) { //add match
    if (req.authLevel < 2) return res.status(401).end();
    var x = req.game.teams.push(req.body);
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      io.to(req.game.name).emit('newTeam',req.game.teams[x]);
      res.send(req.body);
    });
  });

module.exports = router;

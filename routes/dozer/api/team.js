var express = require('express');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var vars = require('./../vars.js'),
  io = vars.io.of('/game');
  uploadsDir = vars.uploadsDir;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file)
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, String(req.team._id))
  }
})

var upload = multer({limits:{files:1},storage: storage})

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
  }, upload.single("pic") ,function (req,res) {
    console.log(req.file)
    req.team.pic = '/uploads/' + req.file.filename;
    req.game.save(function (err) {
      if (err) res.status(500).send("Error saving game");
      else {
        io.to(req.game.name).emit('editTeam',req.team);
        res.send(req.team.pic);
      }
    });
  }])
  .delete(function (req,res) {
    if (req.authLevel < 2) return res.status(401).end();
    
    fs.unlink(uploadsDir+req.team.pic,function (err) {
      if (err) res.status(500).send(err);
      else {
        req.team.pic = undefined;
        req.game.save(function (err) {
          if (err) res.status(500).send(err);
          else {
            io.to(req.game.name).emit('editTeam',req.team);
            res.send(req.team);
          }
        });
      }
    });
  });

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
    req.game.teams.push(req.body);
    req.game.save(function (err,game) {
      if (err) return res.status(500).send(err);
      io.to(req.game.name).emit('newTeam',game.teams[game.teams.length-1]);
      res.send(game.teams[game.teams.length-1]);
    });
  });

module.exports = router;

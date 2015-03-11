var express = require('express');
var router = express.Router();
var vars = require('./../vars.js'),
  io = vars.io.of('/game');

router.param('sub' ,function (req,res,next,id) {
  if (!req.game) return next(new Error("Not Game!"));

  var s = req.game.submissions.id(id);
  if (!s) return next(new Error("Team not found"));

  req.sub = s;
  next();
});

router.route('/:sub')
  .get(function (req,res) { //gets match with given id
    if (req.authlevel < 1) return res.status(401).send("Not authorized");
    res.send(req.sub);
  })
  .put(function (req,res) { //edit one match
    if (req.authlevel < 2) return res.status(401).send("Not authorized");
    var y = req.sub.set(req.body);
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      res.send(req.body);
      io.to(req.game.name).emit('editSub',y);
    });
  })
  .delete(function (req,res) {
    if (req.authlevel < 2) return res.status(401).send("Not authorized");
    req.sub.remove();
    req.game.save(function (err) {
      if (err) return res.status(500).send(err);
      io.to(req.game.name).emit('delSub',req.sub);
      res.send(req.sub._id);
    })
  });

router.route('/')
  .get(function (req,res) {
    if (req.authlevel < 1) return res.status(401).send("Not authorized");
    res.send(req.game.submissions);
  })
  .post(function (req,res) { //add match
    if (req.authlevel < 2) return res.status(401).send("Not authorized");
    var y = req.game.submissions.push(req.body);
    req.game.save(function (err,x) {
      if (err) return res.status(500).send(err);
      io.to(req.game.name).emit('newSub',x.submissions[y-1]);
      res.send(x.submissions[y-1]);
    });
  })
  .delete(function (req,res) { //remove all submissions (reset)
    if (req.authlevel < 3) return res.status(401).send("Not authorized");
    req.game.submissions = [];
    req.game.save(function (err,x) {
      if (err) return res.status(500).send(err);
      io.to(req.game.name).emit('resetSubs',[]);
      res.send(x.submissions);
    })
  });

module.exports = router;

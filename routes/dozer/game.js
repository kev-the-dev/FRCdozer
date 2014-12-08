var express = require('express');
var router = express.Router();
var frc = require('./vars.js');
router.get('/', function (req,res) { //get current game
  frc.games.findById(frc.game, function (err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.post('/', function (req,res) { //create new game
  frc.games.create(req.body,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.get('/:id', function (req,res) { //get given game with id
  frc.games.findById(req.params.id,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.put('/:id', function (req,res) { //edit game with id
  frc.games.findByIdAndUpdate(req.params.id,req.body,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.delete('/:id', function (req,res) { //delete game with id
  frc.games.findByIdAndRemove(req.params.id,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
module.exports = router;

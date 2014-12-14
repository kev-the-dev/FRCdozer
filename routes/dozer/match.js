var express = require('express');
var router = express.Router();
var frc = require('./vars.js');
router.get('/', function (req,res) { //return all matches
  frc.matches.find({},function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.get('/:id', function (req,res) { //gets match with given id
  frc.matches.findById(req.params.id,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.post('/', function (req,res) { //add match
  frc.matches.create (req.body,function(err,x) {
    if (err) {
      res.status(500);
      res.send(err);
    }
    else {
      res.send(x);
      console.log(frc.io);
      frc.io.emit('newMatch',x);
    }
  });
});
router.put('/:id', function (req,res) { //edit one match
  frc.matches.findByIdAndUpdate(req.params.id,req.body,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  });
});
router.delete('/:id', function (req,res) {
  frc.matches.findByIdAndRemove(req.params.id,function(err,x) {
    if (err) res.status(500).send(err);
    else res.send(x);
  }); //delete one match
})
module.exports = router;

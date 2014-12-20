var express = require('express');
var router = express.Router();

var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var games = con.model ('games', new sch({
  name: String,
  description: String,
  game: Array,
  calc: Array,
  submissions: [new sch({
    match: String,
    team: Number,
    elements: Object
  })]
}));

router.route('/game/:id')
  .get('/sub/:s', function (req,res) { //gets match with given id
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        var m = x.submissions.id(s);
        if (m) res.send (m);
        else res.status(500).send("Error: no matched submission");
      }
    });
  })
  .post('/sub', function (req,res) { //add match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        x.submissions.create(req.body);
        s = x.submissions[x.submissions.length-1];
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else res.send(s);
        });
      }
    });
  })
  .put('/sub/:s', function (req,res) { //edit one match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        if (x.submissions.id(s)) {
          x.submissions.id(s) = req.body;
          x.save(function (err,x) {
            if (err) res.status(500).send(err);
            else res.send(req.body);
          });
        }
        else res.status(500).send(err);
      }
  })
  .delete('/sub/:s', function (req,res) {
    frc.matches.findByIdAndRemove(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        frc.io.emit('delMatch',x._id);
        res.send(x);
      }
    });
  })
  .get('/', function (req,res) { //get game with givin id
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .post('/', function (req,res) { //create new game
    games.create(req.body,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .put('/', function (req,res) { //edit game with id
    games.findByIdAndUpdate(req.params.id,req.body,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        res.send(x);
      }
    });
  })
  .delete('/', function (req,res) { //delete game with id
    games.findByIdAndRemove(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });
module.exports = router;

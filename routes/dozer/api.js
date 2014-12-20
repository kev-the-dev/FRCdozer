var express = require('express');
var router = express.Router();

var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var games = con.model ('games', new sch({
  name: String,
  description: String,
  game: [{name:String,type:String}],
  calc: [{name:String,elements:[{name:String,worth:Number}]}],
  submissions: [new sch({
    match: String,
    team: Number,
    elements: Object
  })]
}));

router.route('/game/:id/sub/:s')
  .get(function (req,res) { //gets match with given id
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        var m = x.submissions.id(s);
        if (m) res.send (m);
        else res.status(500).send("Error: no matched submission");
      }
    });
  })
  .put(function (req,res) { //edit one match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        var e = undefined;
        (x.submissions.id(s) || e) = req.body;
        if (e) res.send ("Error: Submission not found");
        else {
          x.save(function (err,x) {
            if (err) res.status(500).send(err);
            else res.send(req.body);
          });
        }
      }
    });
  })
  .delete(function (req,res) {
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        var remove = x.submissions.id(s);
        console.log(remove);
        res.send('Not implemented yet');
      }
    });
  });

router.post('/game/:id/sub', function (req,res) { //add match
  games.findById(req.params.id, function (err,x) {
    if (err) res.status(500).send(err);
    else {
      y = x.submissions.push(req.body);
      x.save(function (err) {
        if (err) res.status(500).send(err);
        else res.send(y);
      });
    }
  });
});

router.route('/game/:id')
  .get(function (req,res) { //get game with givin id,
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        //x.submissions=null;
        res.send(x);
      }
    });
  })
  .post(function (req,res) { //create new game
    req.body.submissions=[];
    games.create(req.body,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .put(function (req,res) { //edit game with id
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        y = x.submissions;
        x = req.body;
        x.submissions = y;
        x.save(function (err,x) {
          if (err) res.status(500).send (err);
          else res.send(x);
        });
      }
    });
  })
  .delete(function (req,res) { //delete game with id
    games.findByIdAndRemove(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });

module.exports = router;

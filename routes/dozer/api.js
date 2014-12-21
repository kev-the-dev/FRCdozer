var express = require('express');
var router = express.Router();

var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var games = con.model ('games', new sch({
  name: String,
  description: String,
  game: [new sch({name:String,type:String})],
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
            else res.send(y);
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
            else res.send("Removed: "+y._id);
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
        console.log(y);
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else res.send(x.submissions[y-1]);
        });
      }
    });
  });

router.route('/game/:id')
  .get(function (req,res) { //get game with givin id,
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .put(function (req,res) { //edit game with id
    games.findByIdAndUpdate(req.params.id,{$set:req.body||null},function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .delete(function (req,res) { //delete game with id
    games.findByIdAndRemove(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });

router.route('/game')
  .post(function (req,res) {
    req.body.submissions=[];
    games.create(req.body,function(err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  })
  .get(function (req,res) {
    games.find({}, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x);
    });
  });

module.exports = router;

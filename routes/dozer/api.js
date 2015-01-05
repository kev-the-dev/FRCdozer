var express = require('express');
var router = express.Router();
var vars = require('./vars.js'),
    games = vars.games,
    io = vars.io.of('/game');

router.use(require('./auth.js'));

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
            else {
              res.send(y)
              io.to(x.name).emit('editSub',y);
            };
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
            else {
              io.to(z.name).emit('delSub',y);
              res.send("Removed: "+y._id)
            };
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
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else {
            io.to(x.name).emit('newSub',x.submissions[y-1]);
            res.send(x.submissions[y-1])
          };
        });
      }
    });
  });

router.route('/game/:id/team/:s')
  .get(function (req,res) { //gets match with given id
    games.findById(req.params.id,function(err,x) {
      if (err) res.status(500).send(err);
      else {
        var m = x.teams.id(req.params.s);
        if (m) res.send (m);
        else res.status(500).send("Error: no matched team");
      }
    });
  })
  .put(function (req,res) { //edit one match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        var y = x.teams.id(req.params.s);
        if (y) {
          y.set(req.body);
          x.save(function (err) {
            if (err) res.status(500).send(err);
            else {
              res.send(y)
              io.to(x.name).emit('editTeam',y);
            };
          });
        }
        else res.status(500).send('Error: team not found');
      }
    });
  })
  .delete(function (req,res) {
    games.findById(req.params.id,function(err,z) {
      if (err) res.status(500).send(err);
      else if (z) {
        var y = z.teams.id(req.params.s);
        if (y) {
          y.remove();
          z.save (function (err) {
            if (err) res.status(500).send (err);
            else {
              io.to(z.name).emit('delTeam',y);
              res.send("Removed: "+y._id)
            };
          });
        }
        else res.status(500).send('Error: team not found');
      }
    });
  });

router.route('/game/:id/team')
  .get(function (req,res) {
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else res.send(x.teams);
    });
  })
  .post(function (req,res) { //add match
    games.findById(req.params.id, function (err,x) {
      if (err) res.status(500).send(err);
      else {
        y = x.teams.push(req.body);
        x.save(function (err) {
          if (err) res.status(500).send(err);
          else {
            io.to(x.name).emit('newTeam',x.teams[y-1]);
            res.send(x.teams[y-1])
          };
        });
      }
    });
  });

router.route('/game/:id')
  .get(function (req,res) { //get game with givin id,
    games.findById(req.params.id, function (err,x) {
      if (err) games.findOne({name:req.params.id}, function (err,x) {
        if (err) res.status(500).send(err);
        else if (x) res.send(x);
        else res.status(500).send("not found");
      });
      else if (x) res.send(x);
      else res.status(500).send("not found");
    });
  })
  .put(function (req,res) { //edit game with id
    games.findByIdAndUpdate(req.params.id,{$set:req.body||null},function(err,x) {
      if (err) res.status(500).send(err);
      else {
        io.to(x.name).emit('editGame',x);
        res.send(x);
      };
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
  });

module.exports = router;

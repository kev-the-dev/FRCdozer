var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var vars = require('./../vars.js'),
    io = vars.io.of('/game');

function validTBA (req,res,next) { //confirms
  var confirm = crypto.createHash('sha1');
  confirm.update(req.game.tba.key || "");
  confirm.update(req.rawPayload);
  var sum = confirm.digest('hex');

  if (sum === req.headers['x-tba-checksum']) {
    req.body = JSON.parse(req.rawPayload);
    return next();
  }
  else {
    res.status(401).end();
  }
}

router.get('/', function (req,res) {
  if (req.authlevel<1) return res.status(401).end();
  if (req.authlevel<4) return res.send({event_key: (req.game.tba.event_key) });
  res.send(req.game.tba);
});

router.post('/hook', [validTBA,function (req,res) { //Respond to webhook requests from TBA
  switch (req.body.message_type) {
    case "match_score":
      io.to(req.game.name).emit("editMatch",req.body);
      res.end();
      break;
    case "upcoming_match":
      io.to(req.game.name).emit('upcomingMatch',req.body);
      res.end();
      break;
    case "verification" :
      req.game.tba.verification_key = (req.body.message_data || {}).verification_key || undefined;
      req.game.save(function (err) {
        if (err) res.status(500).send(err);
        else res.end();
      });
      break;
    case "ping" :
      io.to(req.game.name).emit("TBAping",req.body.message_data);
      res.end();
      break;
    default:
      res.end();
  }
}]);
module.exports = router;

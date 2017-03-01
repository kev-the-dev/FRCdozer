var express = require('express');
var router = express.Router();
var https = require('https');
var vars = require('./vars.js'),
    games = vars.games,
    users = vars.users,
    io = vars.io.of('/game');

router.use(require('./auth.js'));
router.use('/game',require('./api/game.js'));
router.use('/org',require('./orgs.js'));

router.get('/tbaproxy*', function(req,res) {
  https.get('https://www.thebluealliance.com/api/v2'+req.url.slice(9), function (tba) {
    tba.on('data',function (x) {
      res.write(x);
    });
    tba.on('end', function() {
      res.end();
    });
  });
});

module.exports = router;

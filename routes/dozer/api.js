var express = require('express');
var router = express.Router();
router.use('/match',require('./match.js'));
router.use('/game',require('./game.js'));
router.use('/admin',require('./admin.js'));
module.exports = router;

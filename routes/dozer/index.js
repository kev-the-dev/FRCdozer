var express = require('express');
var path = require('path');
var router = express.Router();
router.use('/api',require('./api.js'));
router.use('/',express.static('./public'));
module.exports = router;

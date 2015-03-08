var express = require('express');
var path = require('path');
var router = express.Router();
var vars = require('./vars.js');
router.use('/',express.static('./public'));
router.use('/api',require('./api.js'));

module.exports = router;

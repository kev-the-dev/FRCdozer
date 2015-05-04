var express = require('express');
var path = require('path');
var router = express.Router();
var vars = require('./vars.js');

router.use('/',express.static(vars.publicDir));
router.use('/uploads/',express.static(vars.uploadsDir+'/uploads'));
router.use('/api',require('./api.js'));

module.exports = router;

#!/usr/bin/env node
var https = require('https');
var http = require('http');
var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var debug = require('debug')('expressTest');
var passport = require('passport');
var expressSession = require('express-session');
var compression = require('compression');
var server;
var configApp = function () {
  require('./routes/dozer/vars.js').io=require("socket.io")(server);

  app.use(favicon(__dirname + '/public/favicon.ico'));

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(compression());
  
  app.use('/',require('./routes/dozer/index.js'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send("Error: "+err);
  });

  var debug = require('debug')('expressTest');
  app.set('port', process.env.PORT || 3000);
  server.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
  });
}
fs.readFile('/etc/nginx/ssl/riptiderobotics-dec.key', function (err,keyfile) { //tries to find key and cert file, makes http server if not found
  if (err || !keyfile) {
    server = http.createServer(app);
    configApp();
  }
  else fs.readFile('/etc/nginx/ssl/ssl-unified.crt', function (err, certfile) {
    if (err || !certfile) {
      server = http.createServer(app);
      configApp();
    }
    else {
      server = https.createServer({
        cert: certfile,
        key: keyfile
      },app);
      configApp();
    }
  });
});

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
var defaultSettings = {
  port : 3000,
  database : {
    url : "mongodb://localhost/dozer"
  },
  publicDir : "./public/dist"
}

var settings = JSON.parse(fs.readFileSync("./config.json"));

if (!settings) settings= defaultSettings;

if (settings.https) {
  var key = fs.readFileSync(settings.https.key);
  var cert = fs.readFileSync(settings.https.cert);
  if (key && cert) server = https.createServer({
    cert: cert,
    key: key
  },app);
  else server = http.createServer(app);
} else server = http.createServer(app);

var vars = require('./routes/dozer/vars.js');
    vars.io=require("socket.io")(server);
    vars.initDB(settings.database.url || defaultSettings.database.url);
    vars.publicDir = settings.publicDir || defaultSettings.publicDir;

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
  console.log(err);
  res.status(err.status || 500);
  res.send(err);
});

var debug = require('debug')('expressTest');

app.set('port', settings.port || defaultSettings.port);

server.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
module.exports = server;

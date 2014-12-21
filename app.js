#!/usr/bin/env node
var https = require('https');
var fs = require('fs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongoose');
var app = express();
var debug = require('debug')('expressTest');
var passport = require('passport');
var expressSession = require('express-session');
var server = https.createServer({
  cert: fs.readFileSync('/etc/nginx/ssl/ssl-unified.crt'),
  key: fs.readFileSync('/etc/nginx/ssl/riptiderobotics-dec.key')
},app);

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
  secret:'badkey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/',require('./routes/dozer/index.js'));
//require('./routes/dozer/socket.js')(server);
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

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var passport = require('passport');
var passportLocal = require('passport-local');
var session = require('express-session'),
    sessionStore = new session.MemoryStore();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var vars= require('./vars.js'),
    users=vars.users,
    io=vars.io

var COOKIE_SECRET = 'badkey';
var COOKIE_NAME = 'connect.sid';

router.use(session({
  name : COOKIE_NAME,
  secret: COOKIE_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));
function safe (x) {
  x.password = undefined;
  x.salt = undefined;
  return x;
}
router.use(passport.initialize());
router.use(passport.session());
passport.use(new passportLocal.Strategy(function(name,pass,done) {
  users.findOne({username:name}, function (err,x) {
    if (err) done(err,null);
    else if (x) crypto.pbkdf2(pass,x.salt, 10000, 64, function(err, derivedKey) {
      if (err) done(err,null);
      else {
        if (derivedKey.toString('base64')===x.password.toString('base64')) {
          done(null,x);
        }
        else done(null,null);
      }
    });
    else done(null,null);
  });
}));
passport.serializeUser(function (user,done) {
  if (user._id) done(null,user._id);
  else done(null,null);
});
passport.deserializeUser(function (id,done) {
  users.findById(id, function (err,x) {
    if (err) done (err,null);
    else if (x) done(null,x);
    else done(null,null);
  })
});
router.post('/login',passport.authenticate('local'),function (req,res) {
  res.send(safe(req.user));
});
router.post('/logout', function (req,res) {
  req.logout();
  res.send('You have logged out');
});
router.post('/register', function (req,res) {
  var user = req.body.username;
  var pass = req.body.password;
  if (user && pass) {
    crypto.randomBytes(32, function(ex,buf) { //generates salt
      if (ex) res.status(500).send("random bytes crypto error");
      else {
        var salt = buf.toString('base64');
        crypto.pbkdf2(pass, salt, 10000, 64, function(err, derivedKey) {
          if (err) res.status(500).send ("pdkdf2 crypto error");
          else users.create({username:user,password:derivedKey.toString('base64'),salt:salt}, function (err,x) {
            if (err) res.status(500).send (err);
            else if (x) res.send(safe(x));
            else res.status(500).send("mongo messed up");
          });
        });
      }
    });
  }
  else res.status(500).send('No username or password');
});
router.get('/hello', function (req,res) {
  if (req.user) res.send (safe(req.user));
  else res.status(500).send("Not logged in");
});
router.put('/password', function (req,res) {
  if (req.user && req.body.password && req.user.salt) users.findById(req.user._id, function (err,x) {
    if (err) res.status(500).send(err);
    else if (x) crypto.pbkdf2(req.body.password, req.user.salt, 10000, 64, function(err, derivedKey) {
      if (err) res.status(500).send(err)
        else if (derivedKey) {
          x.password = derivedKey.toString('base64');
          x.save(function (err,x) {
            if (err) res.status(500).send(err);
            else if (x) res.send("Password changed for "+x.username);
            else res.status(500).send("Not saved.");
          });
        }
        else res.status(500).send("No key made");
      });
      else res.status(500).send("No user found");
    });
    else res.status(500).send("You are not logged in");
});


var game = io.of('/game')
  .on('connection', function (socket) {
    var name = socket.handshake.query.name;
    if (name) {
      //auth code here
      socket.join(name);
      console.log('added socket to: '+name);
      game.emit('message','Will receive from: '+name);
      game.to(name).emit('message','to a room!');
    }
    else socket.disconnect();
  });
/*
io.use(function(socket, next) {
  try {
    var data = socket.handshake || socket.request;
    if (! data.headers.cookie) {
      return next(new Error('Missing cookie headers'));
    }
    var cookies = cookie.parse(data.headers.cookie);
    if (! cookies[COOKIE_NAME]) {
      return next(new Error('Missing cookie ' + COOKIE_NAME));
    }
    var sid = cookieParser.signedCookie(cookies[COOKIE_NAME], COOKIE_SECRET);
    if (! sid) {
      return next(new Error('Cookie signature is not valid'));
    }
    data.sid = sid;
    sessionStore.get(sid, function(err, session) {
      console.log(err,session);

      //if (err) return next(err);
      //if (! session) return next(new Error('session not found'));
      socket.session = session || null;
      //console.log(session);
      return next();
      //
    });
  } catch (err) {
    next();
    console.error(err);
  }
});
*/
module.exports = router;

var express = require('express'); //test
var router = express.Router();
var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var games = con.model ('FRCgames', new sch({
  name: {type:String,unique:true,required:true},
  description: String,
  game: [new sch({name:String,type:String})],
  calc: [{name:String,elements:[{name:String,worth:Number}]}],
  tbakey: String,
  tbaverification:String,
  submissions: [new sch({
    match: String,
    side: String,
    team: Number,
    elements: Object
  })],
  teams: [new sch({
    team:Number,
    notes:String,
    name:String,
    pic:String
  })],
  /*
    0 = nothing/blocked. Used to explicitly state user is not allowed
    1 = read/view everthing, edit nothing (observer)
    2 = add/edit submissions, team names/notes (scouter)
    3 = edit game (Moderator)
    4 = change other user's permissions (Admin)
  */
  permissions: { //For permissions, object of permissions.users.Bob = 1, permissions.others = 0
    users:{type:Object,required:true},
    others: {type:Number,default:1}
  }
}));
var users = con.model('users', new sch({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  salt:String,
  info:Object,
  games:Object //List of games with permission levels
}));

var allow = function can(user,level,permissions) {
  if (permissions.others >= level) {
    return true;
  }
  if (permissions.users[user] >= level) {
    return true;
  }
  return false;
}

module.exports = {
  users: users,
  games: games,
  io: undefined,
  allow: allow
};

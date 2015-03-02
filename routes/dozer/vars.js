var express = require('express'); //test
var router = express.Router();
var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var games = con.model ('FRCgames', new sch({
  name: {type:String,unique:true},
  description: String,
  game: [new sch({name:String,type:String})],
  calc: [{name:String,elements:[{name:String,worth:Number}]}],
  submissions: [new sch({
    match: String,
    side: String,
    team: Number,
    elements: Object
  })],
  teams: [{team:Number,notes:String,name:String}]
}));
var users = con.model('users', new sch({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  salt:String,
  info:Object
}));
module.exports = {
  users: users,
  games: games,
  io: undefined
};

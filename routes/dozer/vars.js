var express = require('express');
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
  teams: [new sch({team:{type:Number,unique:true},notes:String,name:String})]
}));
<<<<<<< HEAD
out.matchesSchema = new sch({
  team: Number,
  elements: Object
});
out.game = '5483a9f3ceeb864d701f713d';
out.games.findById(out.game, function (err,x) { //finds default game and sets to current game
  if (err || !x) {
    out.games.create({
      name:'Demo',
      game:[{name:'Goals',type:'Number'},{name:'Comment',type:'String'},{name:'Legit',type:'Boolean'}],
      calc:[{name:'Total',elements:[{name:'Goals',worth:10},{name:'Legit',worth:50}]}]
    },function (err,y) {
      out.game = y._id;
      out.matches = con.model(y.name,out.matchesSchema);
    });
  }
  else {
    out.matches = con.model(x.name,out.matchesSchema);
  }
});
module.exports = out;
=======
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
>>>>>>> 0df780bd5812027d8f7df1daa863c1f0a1be1e34

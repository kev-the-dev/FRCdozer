var mon = require('mongoose');
var sch = mon.Schema;
var games,users,io,con,publicDir,pictureDir;

var exports = {};

exports.initDB = function (url) {

  con = mon.createConnection(url);

  exports.games = con.model ('games', new sch({
    name: {type:String,unique:true,required:true},
    description: String,
    game: [new sch({name:String,type:String})],
    calc: [{name:String,elements:[{name:String,worth:Number}]}],
    tba: {
      event_key: String,
      key: String,
      verification_key: String
    },
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
    permissions: { //For permissions, object of permissions.users.Bob = 1, permissions.others = 0
      users:{type:Object,required:true},
      others: {type:Number,default:1}
    }
  }));

  exports.users = con.model('users', new sch({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    salt:String,
    info:Object,
    games:[{ type: sch.Types.ObjectId, ref: 'games' }]
  }));
};

module.exports = exports;
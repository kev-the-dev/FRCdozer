var mon = require('mongoose');
var con = mon.createConnection("mongodb://localhost/FRC");
var sch = mon.Schema;
var out = {};
out.games = con.model ('games', new sch({
  name: String,
  game: Array,
  calc: Array
}));
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

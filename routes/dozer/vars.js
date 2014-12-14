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
  if (err) console.log(err);
  else {
    out.matches = con.model(x.name,out.matchesSchema);
  }
});
module.exports = out;

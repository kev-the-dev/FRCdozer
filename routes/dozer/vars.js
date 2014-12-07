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
out.games.findById('5483a9f3ceeb864d701f713d', function (err,x) { //finds default game and sets to current game
  if (err) console.log(err);
  else {
    out.game = x;
    out.matches = con.model(out.game.name,out.matchesSchema);
  }
});
module.exports = out;

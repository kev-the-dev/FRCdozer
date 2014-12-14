var frc = require('./vars.js')
module.exports = function (server) {
  var io = frc.io = require('socket.io').listen(server)
  .on('connection',function(socket) {
    socket.on('newMatch', function (m) {
      frc.matches.create(m, function (err,x) {
        if (err) io.emit('error',err);
        else io.emit('newMatch',x);
      });
    });
    socket.on('delMatch', function (id) {
      frc.matches.findByIdAndRemove(id, function (err,x) {
        if (err) io.emit('error',err);
        else io.emit('delMatch',x._id);
      });
    });
    socket.on('editMatch', function (mat) {
      frc.matches.findByIdAndUpdate(mat._id,mat,function (err,x) {
        if (err) io.emit('error',err);
        else io.emit('editMatch',x);
      });
    });
    socket.on('editGame', function (x) {
      x = JSON.parse(x);
      frc.games.findByIdAndUpdate(x._id,x, function (err,y) {
        if (err) io.emit('error',err);
        else io.emit('editGame',y);
      });
    });
  });
};

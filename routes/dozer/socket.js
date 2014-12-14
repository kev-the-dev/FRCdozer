module.exports = function (io) {
  io.on('connection', function (socket) {
    console.log('connected');
    io.emit('message','Hi!');
  });
  require('./vars.js').io=io;
};

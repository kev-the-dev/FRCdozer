var socket;
module.exports = function (io) {
  if (io) socket=io;
  console.log(socket);
  socket.on('connection', function(socket){
    console.log('connected!');
    io.emit('message','Hello, socket!');
  });
};

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

function findRooms(thingy) {
  var availableRooms = [];
  var rooms = thingy.rooms;
  if (rooms) {
    for (let [key, value] of rooms) {
      if (!value.has(key)) {
        availableRooms.push(key);
      }
    }
  }
  return availableRooms;
}

app.use(express.static('src/public'));

io.on("connection", socket => {
  socket.emit('rooms', { rooms: findRooms(io.sockets.adapter) });

  socket.on('joinRoom', roomName => {
   socket.leaveAll();
    socket.join(roomName);
    io.sockets.emit('rooms', { rooms: findRooms(io.sockets.adapter) });
  });

  socket.on('startGame', () => {

  });

  socket.on('disconnect', socket => {

  });
});

server.listen(3000);


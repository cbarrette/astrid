const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

function findRooms() {
  let availableRooms = [];
  const rooms = io.sockets.adapter.rooms;
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
  socket.emit('rooms', { rooms: findRooms() });

  socket.on('joinRoom', roomName => {
    if (roomName.startsWith('game.') || findRooms().includes(`game.${roomName}`)) {
      return; // TODO return error
    }
    socket.leaveAll();
    socket.join(roomName);
    io.sockets.emit('rooms', { rooms: findRooms() });
  });

  socket.on('startGame', async () => {
    const roomName = socket.rooms.values().next().value; // Optimism power !!!

    io.in(roomName).socketsJoin(`game.${roomName}`);
    io.in(roomName).socketsLeave(roomName);

    for (let client of io.sockets.adapter.rooms.get(`game.${roomName}`).values()) {
      const socket = io.sockets.sockets.get(client);
      socket.on('move', data => { // game move!

      });
    }

    socket.on('disconnect', socket => {

    });
  });
});

server.listen(3000);


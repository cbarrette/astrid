const express = require('express');
const app = express();
const server = require('http').createServer(app);
import {Server} from 'socket.io'

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

function findRooms() {
  let availableRooms = [];
  const rooms = io.sockets.adapter.rooms;
  if (rooms) {
    // @ts-ignore
    for (let [key, value] of rooms) {
      if (!value.has(key)) {
        availableRooms.push(key);
      }
    }
  }
  return availableRooms;
}

app.use(express.static('src/public'));

function getCurrentActiveClientCount() {
  return io.sockets.sockets.size;
}

io.on("connection", socket => {
  console.log(`Connection received. Clients: ${getCurrentActiveClientCount()}`);
  socket.emit('rooms', { rooms: findRooms() });

  socket.on('joinRoom', roomName => {
    console.log(`client joining room ${roomName}`);
    if (roomName.startsWith('game.') || findRooms().includes(`game.${roomName}`)) {
      return; // TODO return error
    }
    // @ts-ignore
    socket.leaveAll();
    socket.join(roomName);
    console.log('Broadcasting rooms');
    io.sockets.emit('rooms', { rooms: findRooms() });
  });

  socket.on('startGame', async () => {
    console.log('Starting a new game');
    const roomName = socket.rooms.values().next().value; // Optimism power !!!

    io.in(roomName).socketsJoin(`game.${roomName}`);
    io.in(roomName).socketsLeave(roomName);

    // @ts-ignore
    for (let client of io.sockets.adapter.rooms.get(`game.${roomName}`).values()) {
      const socket = io.sockets.sockets.get(client);
      // @ts-ignore
      socket.on('move', data => { // game move!

      });
    }
  });

  socket.on('disconnect', socket => {
    console.log(`Connection closed. Clients: ${getCurrentActiveClientCount()}`);
  });
});

server.listen(3000);

console.log('Server listening on port 3000');


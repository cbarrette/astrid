const socket = io();

socket.on('rooms', rooms =>
  console.log(rooms)
);
socket.on('message', data => console.log({ data }))
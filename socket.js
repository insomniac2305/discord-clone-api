require("dotenv").config();
const { Server } = require("socket.io");
const { checkAuth } = require("./middleware/auth");

let io;

exports.initSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
    });

    socket.on("leaveChannel", (channelId) => {
      socket.leave(channelId);
    });
  });
};

exports.emitToRoom = (event, room, message) => {
  io.to(room).emit(event, message);
};

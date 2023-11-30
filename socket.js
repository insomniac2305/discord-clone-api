require("dotenv").config();
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const Server = require("./models/Server");

let io;

exports.initSocketIO = (httpServer) => {
  io = new socketio.Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChannel", (channelId, token) => {
      const secret = process.env.JWT_SECRET;
      jwt.verify(token, secret, async (jwtError, payload) => {
        if (jwtError) {
          console.error("Could not verify jwt: " + jwtError);
          return;
        }

        const userId = payload.sub;
        let server;

        try {
          server = await Server.findOne({ channels: channelId });
          if (!server) {
            console.log("Server not found with channel: " + channelId);
            return;
          }
        } catch (serverError) {
          console.error("Could not find user from jwt: " + serverError);
        }

        const isMember = server.members.find((member) => member.user.toString() === userId);

        if (isMember) {
          socket.join(channelId);
        } else {
          console.log(`User ${userId} is not member of server ${server._id}, socket not joining channel.`);
        }
      });
    });

    socket.on("leaveChannel", (channelId) => {
      socket.leave(channelId);
    });
  });
};

exports.emitToRoom = (event, room, message) => {
  io.to(room).emit(event, message);
};

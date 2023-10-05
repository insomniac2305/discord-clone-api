const asyncHandler = require("express-async-handler");
const { param, body } = require("express-validator");
const { bodyRequired, catchValidationErrors, moveUpload, deleteUploadDir } = require("./controllerHelper");
const mongoose = require("mongoose");
const Server = require("../models/Server");
const Channel = require("../models/Channel");
const upload = require("../middleware/upload");

const addParamServerToReq = [
  param("serverid").isMongoId().withMessage("Server ID is not valid"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const server = await Server.findById(req.params.serverid);

    if (!server) {
      return res.status(404).json({
        message: "Server not found",
      });
    }

    req.queriedServer = server;

    return next();
  }),
];

exports.addParamServerToReq = addParamServerToReq;

const checkServerPermissions = (role) => (req, res, next) => {
  const hasRole = req.queriedServer.members.find(
    (member) =>
      member.user.toString() === req.user._id.toString() && //User is member
      (role !== Server.Roles.Admin || //Check for admin permission
        member.role === Server.Roles.Admin) //User is admin
  );

  if (!hasRole) {
    return res.status(401).json({
      message: "Insufficient permission to perform this action",
    });
  }

  return next();
};

exports.checkServerPermissions = checkServerPermissions;

exports.getServers = asyncHandler(async (req, res) => {
  const servers = await Server.find({ "members.user": req.user._id });
  return res.json(servers);
});

exports.postServers = [
  upload.single("icon"),
  bodyRequired("name", "Server name"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const server = new Server({
        name: req.body.name,
        iconUrl: req.body.iconurl,
      });
      const defaultTextChannel = new Channel({
        name: "General",
        type: Channel.Types.Text,
      });
      const defaultVoiceChannel = new Channel({
        name: "General",
        type: Channel.Types.Voice,
      });

      await defaultTextChannel.save({ session });
      await defaultVoiceChannel.save({ session });

      server.channels = [defaultTextChannel, defaultVoiceChannel];

      server.members = [
        {
          user: req.user.id,
          role: Server.Roles.Admin,
        },
      ];

      if (req.file) {
        await moveUpload(req.file.filename, "servers", server._id.toString());
        server.icon = req.file.filename;
      }

      await server.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(server);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return next(error);
    }
  }),
];

exports.getServer = [
  addParamServerToReq,
  checkServerPermissions(Server.Roles.Member),
  asyncHandler(async (req, res) => {
    return res.json(req.queriedServer);
  }),
];

exports.putServer = [
  addParamServerToReq,
  checkServerPermissions(Server.Roles.Admin),
  upload.single("icon"),
  body("name").trim().escape(),
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;

    if (req.body.name) server.name = req.body.name;

    if (req.file) {
      await moveUpload(req.file.filename, "servers", server._id.toString());
      server.icon = req.file.filename;
    }

    await server.save();

    return res.json(server);
  }),
];

exports.deleteServer = [
  addParamServerToReq,
  checkServerPermissions(Server.Roles.Admin),
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      server.channels.forEach(async (channel) => {
        await Channel.deleteOne({ _id: channel._id }, { session });
      });

      await server.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      return next(error);
    }
    await deleteUploadDir("servers", server._id.toString());
    return res.status(204).send();
  }),
];

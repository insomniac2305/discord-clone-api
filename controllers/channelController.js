const asyncHandler = require("express-async-handler");
const { param, body } = require("express-validator");
const { bodyRequired, catchValidationErrors } = require("./controllerHelper");
const mongoose = require("mongoose");
const Server = require("../models/Server");
const Channel = require("../models/Channel");
const { addParamServerToReq, checkServerPermissions } = require("./serverController");

const addParamChannelToReq = [
  param("channelid").isMongoId().withMessage("Channel ID is not valid"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const channel = await Channel.findById(req.params.channelid);
    const isPartOfServer = req.queriedServer.channels.includes(req.params.channelid);

    if (!channel || !isPartOfServer) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    req.queriedChannel = channel;

    return next();
  }),
];

exports.addParamChannelToReq = addParamChannelToReq;

exports.getServerChannels = [
  addParamServerToReq,
  checkServerPermissions(Server.Roles.Member),
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    await server.populate("channels", "-messages");
    server.channels.sort((a, b) => (a.type < b.type ? -1 : 1));
    return res.json(server.channels);
  }),
];

exports.postServerChannels = [
  addParamServerToReq,
  checkServerPermissions(Server.Roles.Admin),
  bodyRequired("name", "Channel name"),
  bodyRequired("type", "Channel type")
    .isIn(Object.values(Channel.Types))
    .withMessage("Channel type must be text or voice"),
  catchValidationErrors,
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    const channel = new Channel({
      name: req.body.name,
      type: req.body.type,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await channel.save({ session });
      server.channels.push(channel);
      await server.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(channel);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return next(error);
    }
  }),
];

exports.getServerChannel = [
  addParamServerToReq,
  addParamChannelToReq,
  checkServerPermissions(Server.Roles.Member),
  asyncHandler(async (req, res) => {
    return res.json(req.queriedChannel);
  }),
];

exports.putServerChannel = [
  addParamServerToReq,
  addParamChannelToReq,
  checkServerPermissions(Server.Roles.Admin),
  body("name").trim().escape(),
  body("type")
    .trim()
    .escape()
    .isIn(Object.values(Channel.Types))
    .withMessage("Channel type must be text or voice")
    .optional({ values: "null" }),
  catchValidationErrors,
  asyncHandler(async (req, res) => {
    const channel = req.queriedChannel;

    if (req.body.name) channel.name = req.body.name;
    if (req.body.type) channel.type = req.body.type;

    await channel.save();

    return res.json(channel);
  }),
];

exports.deleteServerChannel = [
  addParamServerToReq,
  addParamChannelToReq,
  checkServerPermissions(Server.Roles.Admin),
  asyncHandler(async (req, res) => {
    const server = req.queriedServer;
    const channel = req.queriedChannel;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      server.channels.splice(server.channels.indexOf(channel._id), 1);
      await server.save({ session });
      await channel.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(204).send();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return next(error);
    }
  }),
];

const asyncHandler = require("express-async-handler");
const { param } = require("express-validator");
const { bodyRequired, catchValidationErrors } = require("./controllerHelper");
const Server = require("../models/Server");
const { addParamServerToReq, checkServerPermissions } = require("./serverController");
const { addParamChannelToReq } = require("./channelController");

const addParamMessageToReq = [
  param("messageid").isMongoId().withMessage("Channel ID is not valid"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const message = req.queriedChannel.messages.id(req.params.messageid);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    req.queriedMessage = message;

    return next();
  }),
];

exports.getServerChannelMessages = [
  addParamServerToReq,
  addParamChannelToReq,
  checkServerPermissions(Server.Roles.Member),
  asyncHandler(async (req, res) => {
    const channel = req.queriedChannel;
    await channel.populate("messages.user", "-password");
    return res.json(channel.messages);
  }),
];

exports.postServerChannelMessages = [
  addParamServerToReq,
  addParamChannelToReq,
  checkServerPermissions(Server.Roles.Member),
  bodyRequired("text", "Message text"),
  catchValidationErrors,
  asyncHandler(async (req, res) => {
    const channel = req.queriedChannel;
    const message = {
      text: req.body.text,
      user: req.user._id,
    };

    channel.messages.push(message);

    await channel.save();

    return res.status(201).json(message);
  }),
];

exports.getServerChannelMessage = [
  addParamServerToReq,
  addParamChannelToReq,
  addParamMessageToReq,
  checkServerPermissions(Server.Roles.Member),
  asyncHandler(async (req, res) => {
    const channel = req.queriedChannel;
    await channel.populate("messages.user", "-password");
    return res.json(req.queriedMessage);
  }),
];

exports.putServerChannelMessage = [
  addParamServerToReq,
  addParamChannelToReq,
  addParamMessageToReq,
  checkServerPermissions(Server.Roles.Admin),
  bodyRequired("text", "Message text"),
  catchValidationErrors,
  asyncHandler(async (req, res) => {
    const channel = req.queriedChannel;
    const message = req.queriedMessage;

    message.text = req.body.text;

    await channel.save();

    return res.json(message);
  }),
];

exports.deleteServerChannelMessage = [
  addParamServerToReq,
  addParamChannelToReq,
  addParamMessageToReq,
  checkServerPermissions(Server.Roles.Admin),
  asyncHandler(async (req, res) => {
    const channel = req.queriedChannel;
    const message = req.queriedMessage;

    message.deleteOne();
    await channel.save();

    return res.status(204).send();
  }),
];

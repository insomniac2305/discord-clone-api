const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { param } = require("express-validator");
const { bodyRequired, catchValidationErrors } = require("./controllerHelper");
const Server = require("../models/Server");
const Message = require("../models/Message");
const { addParamServerToReq, checkServerPermissions } = require("./serverController");
const { addParamChannelToReq } = require("./channelController");
const { emitToRoom } = require("../socket");

const addParamMessageToReq = [
  param("messageid").isMongoId().withMessage("Channel ID is not valid"),
  catchValidationErrors,
  asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.messageid);
    const isInChannel = req.queriedChannel.messages.includes(req.params.messageid);

    if (!message || !isInChannel) {
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
    await channel.populate({ path: "messages", populate: { path: "user", select: "-password" } });
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
    const message = new Message({
      text: req.body.text,
      user: req.user._id,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await message.save({ session });
      channel.messages.push(message._id);
      await channel.save({ session });

      await session.commitTransaction();
      session.endSession();

      await message.populate("user", "-password");
      emitToRoom("addMessage", channel.id, message);

      return res.status(201).json(message);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      return next(error);
    }
  }),
];

exports.getServerChannelMessage = [
  addParamServerToReq,
  addParamChannelToReq,
  addParamMessageToReq,
  checkServerPermissions(Server.Roles.Member),
  asyncHandler(async (req, res) => {
    const message = req.queriedMessage;
    await message.populate("user", "-password");
    return res.json(message);
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
    const message = req.queriedMessage;

    message.text = req.body.text;

    await message.save();

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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      channel.messages.splice(channel.messages.indexOf(message._id), 1);
      await channel.save({ session });
      await message.deleteOne({ session });

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

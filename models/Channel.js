const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Types = {
  Text: "text",
  Voice: "voice",
};

const messageSchema = new Schema(
  {
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const channelSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(Types), default: Types.Text },
  messages: [messageSchema],
});

module.exports = mongoose.model("Channel", channelSchema);
module.exports.Types = Types;

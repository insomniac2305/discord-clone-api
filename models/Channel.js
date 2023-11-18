const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Types = {
  Text: "text",
  Voice: "voice",
};

const channelSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(Types), default: Types.Text },
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("Channel", channelSchema);
module.exports.Types = Types;

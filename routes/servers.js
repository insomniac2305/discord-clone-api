const express = require("express");
const serverController = require("../controllers/serverController");
const memberController = require("../controllers/memberController");
const channelController = require("../controllers/channelController");
const messageController = require("../controllers/messageController");
const router = express.Router();

router.get("/", serverController.getServers);

router.post("/", serverController.postServers);

router.get("/:serverid", serverController.getServer);

router.put("/:serverid", serverController.putServer);

router.delete("/:serverid", serverController.deleteServer);

router.get("/:serverid/members", memberController.getServerMembers);

router.post("/:serverid/members", memberController.postServerMembers);

router.put("/:serverid/members/:memberid", memberController.putServerMember);

router.delete("/:serverid/members/:memberid", memberController.deleteServerMember);

router.get("/:serverid/channels", channelController.getServerChannels);

router.post("/:serverid/channels", channelController.postServerChannels);

router.get("/:serverid/channels/:channelid", channelController.getServerChannel);

router.put("/:serverid/channels/:channelid", channelController.putServerChannel);

router.delete("/:serverid/channels/:channelid", channelController.deleteServerChannel);

router.get("/:serverid/channels/:channelid/messages", messageController.getServerChannelMessages);

router.post("/:serverid/channels/:channelid/messages", messageController.postServerChannelMessages);

router.get("/:serverid/channels/:channelid/messages/:messageid", messageController.getServerChannelMessage);

router.put("/:serverid/channels/:channelid/messages/:messageid", messageController.putServerChannelMessage);

router.delete("/:serverid/channels/:channelid/messages/:messageid", messageController.deleteServerChannelMessage);

module.exports = router;

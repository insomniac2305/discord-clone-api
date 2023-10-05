const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");
const serverController = require("../controllers/serverController");
const { checkAuth } = require("../middleware/auth");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get(
  "/files/servers/:serverid/:fileName",
  checkAuth(),
  serverController.addParamServerToReq,
  serverController.checkServerPermissions()
);

router.get("/files/:directory/:id/:fileName", fileController.getFile);

router.get("/", function (req, res, next) {
  res.redirect("./api");
});

module.exports = router;

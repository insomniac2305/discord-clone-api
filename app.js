require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const indexRouter = require("./routes");
const apiRouter = require("./routes/api");

const app = express();

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", apiRouter);
app.use("/", indexRouter);

app.use((err, req, res, next) => {
  const responseJson = {
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  };
  res.status(err.status || 500).json(responseJson);
});

module.exports = app;

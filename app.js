const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

import logger from "./core/logger";
import acl from "./acl/index";
import apiRoute from "./server/routes/index";
import {
  handleValidateError,
  handleNotFoundError,
} from "./server/middleware/handlerError";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://bintruong:bintruong@cluster0.uezx6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      { useNewUrlParser: true }
    );
  } catch (error) {
    console.error("connect MongoDb has error: " + error);
  }
};

connectMongoDB();

const app = express();
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/")));

app.use("/apis", apiRoute);

// Handle case incorrect API
app.use(handleValidateError);
app.use(handleNotFoundError);

// var publicDir = require('path').join(__dirname);
// app.use(express.static(publicDir));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

global.logger = logger;
global.acl = acl;

module.exports = app;

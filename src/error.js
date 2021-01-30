"use strict";
const rfr = require("rfr");

const logger = rfr("src/logger")(__filename);

const { serializeError } = require("serialize-error");

module.exports = (app) =>
  app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
      res.status(err.status).json({ reason: err.message });
      return;
    }

    logger.error(serializeError(err), "Unknown Error");
    res.status(500).json("Unknown Error");
  });

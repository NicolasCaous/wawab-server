"use strict";
const rfr = require("rfr");

module.exports = (ctx, handler) => async (req, res, next) => {
  await next();
};

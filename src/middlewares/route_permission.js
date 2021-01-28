"use strict";
const rfr = require("rfr");

const UserModel = rfr("src/db/models/User");

module.exports = (ctx, handler) => async (req, res, next) => {
  await next();
};

"use strict";

module.exports = (ctx, handler) => async (req, res, next) => {
  await handler.validate(req, res, next);
};

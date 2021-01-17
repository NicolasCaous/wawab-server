"use strict";

module.exports = (ctx, handler) => async (req, res, next) => {
  await handler.fastValidate(req, res, next);
};

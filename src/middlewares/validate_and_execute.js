"use strict";

module.exports = (ctx, handler) => async (req, res, next) => {
  try {
    await handler.validate(req, res, handler);
  } catch (err) {
    await next(err);
  }
};

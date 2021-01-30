"use strict";

module.exports = (ctx, handler) => async (req, res, next) => {
  try {
    await handler.fastValidate(req, res, next);
  } catch (err) {
    await next(err);
  }
};

"use strict";

module.exports = (ctx) => {
  const handler = async (req, res) => {
    res.status(200).json({ status: "OK" });
  };

  handler.fastValidate = async (req, res, next) => {
    await next();
  };

  handler.validate = async (req, res, handler) => {
    await handler(req, res);
  };

  return handler;
};

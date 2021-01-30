"use strict";

module.exports = (ctx) => {
  const handler = async (req, res) => {
    res.status(200).json({ token: req.params.id });
  };

  handler.fastValidate = async (req, res, next) => {
    console.log("GET fastValidator");
    await next();
  };

  handler.validate = async (req, res, handler) => {
    console.log("GET validator");
    await handler(req, res);
  };

  return handler;
};

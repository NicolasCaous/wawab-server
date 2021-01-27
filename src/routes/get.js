"use strict";

module.exports = (ctx) => {
  const handler = async (req, res) => {
    res.status(200).json(req.auth0data);
  };

  handler.fastValidate = async (req, res, next) => {
    console.log("GET fastValidator");
    await next();
  };

  handler.validate = async (req, res, next) => {
    console.log("GET validator");
    await next();
  };

  return handler;
};
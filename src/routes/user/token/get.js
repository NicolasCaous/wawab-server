"use strict";
const rfr = require("rfr");

const Token = rfr("src/db/models/Token");

const { transaction } = require("@slorm/slorm");

// TODO: get for another user as admin
module.exports = (ctx) => {
  const handler = async (req, res) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      let tokens = await Token.listByUser(trx, req.user.id);

      res.status(200).json(tokens.map((x) => x.content));
    });
  };

  handler.fastValidate = async (req, res, next) => {
    await next();
  };

  handler.validate = async (req, res, handler) => {
    await handler(req, res);
  };

  return handler;
};

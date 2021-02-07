"use strict";
const rfr = require("rfr");

const PhoneModel = rfr("src/db/models/Phone");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      let phones = await PhoneModel.listByUser(trx, req.user.id);

      res.status(200).json(phones);
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

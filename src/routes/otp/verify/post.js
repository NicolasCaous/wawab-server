"use strict";
const rfr = require("rfr");

const PhoneModel = rfr("src/db/models/Phone");

const StringValidator = rfr("src/validators/string");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    res
      .status(200)
      .json(
        await ctx.whatsapp.manager.verifyOTP(
          req.trx,
          req.sender,
          req.body.receiver,
          req.body.code,
          req.user.id
        )
      );
  };

  handler.fastValidate = async (req, res, next) => {
    let errors = {};

    errors.sender = StringValidator(req.body.sender, {
      regex: /^(\d{3,15}@s.whatsapp.net)$/g,
    });
    errors.receiver = StringValidator(req.body.receiver, {
      regex: /^(\d{3,15}@s.whatsapp.net)$/g, // /^(\d{3,15}@s.whatsapp.net)$|^(\d{3,15}-\d{3,15}@g.us)$/
    });
    errors.code = StringValidator(req.body.code, {
      max: 6,
      min: 6,
      regex: /^\d{6}$/g,
    });

    for (let arg in errors) if (errors[arg].length === 0) delete errors[arg];

    if (Object.keys(errors).length !== 0) {
      res.status(400).json({ errors });
      return;
    }

    await next();
  };

  handler.validate = async (req, res, handler) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      req.trx = trx;

      req.sender = await PhoneModel.getByColumn(trx, "jid", req.body.sender);

      if (req.sender === undefined) {
        res.status(404).json({
          reason: `Sender "${req.body.sender}" not found`,
        });
        return;
      }

      if (req.sender.user !== req.user.id) {
        res.status(403).json({
          reason: `Phone jid "${req.body.sender}" is not yours`,
        });
        return;
      }

      await handler(req, res);
    });
  };

  return handler;
};

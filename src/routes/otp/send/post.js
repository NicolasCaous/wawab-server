"use strict";
const rfr = require("rfr");

const PhoneModel = rfr("src/db/models/Phone");

const StringValidator = rfr("src/validators/string");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    let result = await ctx.whatsapp.manager.sendOTP(
      req.trx,
      req.sender,
      req.body.receiver,
      req.body.message,
      req.user.id
    );

    switch (result.status) {
      case "CONNECT_TIMEOUT":
        res.status(400).json({
          reason: result.status,
          fix: "Phone is unreachable",
        });
        break;
      case "CONN_ERROR_CONNECT_FAILED":
        res.status(400).json({
          reason: result.status,
          fix: "Make phone reachable",
        });
        break;
      case "CONN_ERROR_INVALID_CRED":
        res.status(400).json({
          reason: result.status,
          fix: "Update your phone credentials",
        });
        break;
      case "CONN_FAILED_TO_DELIVER":
        res.status(400).json({
          reason: result.status,
          fix: "Make phone reachable",
        });
        break;
      case "CONN_FAILED_TO_VERIFY_IF_TARGET_IS_ON_WHATSAPP":
        res.status(400).json({
          reason: result.status,
          fix: "Make phone reachable",
        });
        break;
      case "SENDER_EXPIRED":
        res.status(400).json({
          reason: result.status,
          fix: "Update sender auth",
        });
        break;
      case "SEND_MESSAGE_TIMEOUT":
        res.status(400).json({
          reason: result.status,
          fix: "Make phone reachable",
        });
        break;
      case "TARGET_NOT_ON_WHATSAPP":
        res.status(409).json({
          reason: result.status,
        });
        break;
      case "VERIFY_IF_TARGET_IS_ON_WHATSAPP_TIMEOUT":
        res.status(400).json({
          reason: result.status,
          fix: "Make phone reachable",
        });
        break;
      case "OK":
        res.status(200).json();
        break;
      default:
        res.status(500).json({ reason: `Unknown status ${result.status}` });
        break;
    }
  };

  handler.fastValidate = async (req, res, next) => {
    let errors = {};

    errors.sender = StringValidator(req.body.sender, {
      regex: /^(\d{3,15}@s.whatsapp.net)$/g,
    });
    errors.receiver = StringValidator(req.body.receiver, {
      regex: /^(\d{3,15}@s.whatsapp.net)$/g, // /^(\d{3,15}@s.whatsapp.net)$|^(\d{3,15}-\d{3,15}@g.us)$/
    });
    errors.message = StringValidator(req.body.message, {
      max: 255,
      min: 1,
      regex: /^(?![\s\S]*(\$\{code\})[\s\S]*(\$\{code\}))[\s\S]*\$\{code\}/g,
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

"use strict";
const rfr = require("rfr");

const PhoneModel = rfr("src/db/models/Phone");

const StringValidator = rfr("src/validators/string");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    res.status(200).json(req.user);
  };

  handler.fastValidate = async (req, res, next) => {
    let errors = {};

    let rules = {
      max: 255,
      min: 16,
    };

    // prettier-ignore
    errors.auth_client_id = StringValidator(req.body.auth_client_id, rules);
    // prettier-ignore
    errors.auth_server_token = StringValidator(req.body.auth_server_token, rules);
    // prettier-ignore
    errors.auth_client_token = StringValidator(req.body.auth_client_token, rules);
    // prettier-ignore
    errors.auth_enc_key = StringValidator(req.body.auth_enc_key, rules);
    // prettier-ignore
    errors.auth_mac_key = StringValidator(req.body.auth_mac_key, rules);

    for (let arg in errors) if (errors[arg].length === 0) delete errors[arg];

    if (Object.keys(errors).length !== 0) res.status(400).json({ errors });
    else await next();
  };

  handler.validate = async (req, res, handler) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      req.trx = trx;
      req.phoneCount =
        (await PhoneModel.countByColumn(trx, "user", req.user.id)) + 1;

      if (req.phoneCount > ctx.limits.MAX_PHONES_PER_USER) {
        res.status(403).json({
          reason: `Maximum limit of ${ctx.limits.MAX_PHONES_PER_USER} api tokens reached"`,
        });
        return;
      }

      /*if (
        (await PhoneModel.countByColumn(trx, "jid", `${req.body.number}@`)) !==
        0
      ) {
        res.status(409).json({
          reason: `Phone ${req.body.number} is already beeing used"`,
        });
        return;
      }*/

      await handler(req, res);
    });
  };

  return handler;
};

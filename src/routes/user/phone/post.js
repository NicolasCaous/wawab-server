"use strict";
const rfr = require("rfr");

const PhoneModel = rfr("src/db/models/Phone");

const StringValidator = rfr("src/validators/string");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    let phone = new PhoneModel({
      auth_client_id: req.whatsAppCred.new_cred
        ? req.whatsAppCred.new_cred.clientID
        : req.body.clientID,
      auth_server_token: req.whatsAppCred.new_cred
        ? req.whatsAppCred.new_cred.serverToken
        : req.body.serverToken,
      auth_client_token: req.whatsAppCred.new_cred
        ? req.whatsAppCred.new_cred.clientToken
        : req.body.clientToken,
      auth_enc_key: req.whatsAppCred.new_cred
        ? req.whatsAppCred.new_cred.encKey
        : req.body.encKey,
      auth_mac_key: req.whatsAppCred.new_cred
        ? req.whatsAppCred.new_cred.macKey
        : req.body.macKey,
      expired: false,
      image_url: req.whatsAppCred.result.user.imgUrl,
      jid: req.whatsAppCred.result.user.jid,
      uname: req.whatsAppCred.result.user.name,
      user: req.user.id,
    });

    await phone._save(req.trx, req.user.id);

    res.status(200).json(req.whatsAppCred);
  };

  handler.fastValidate = async (req, res, next) => {
    let errors = {};

    let rules = {
      max: 255,
      min: 16,
    };

    // prettier-ignore
    errors.clientID = StringValidator(req.body.clientID, rules);
    // prettier-ignore
    errors.serverToken = StringValidator(req.body.serverToken, rules);
    // prettier-ignore
    errors.clientToken = StringValidator(req.body.clientToken, rules);
    // prettier-ignore
    errors.encKey = StringValidator(req.body.encKey, rules);
    // prettier-ignore
    errors.macKey = StringValidator(req.body.macKey, rules);

    for (let arg in errors) if (errors[arg].length === 0) delete errors[arg];

    if (Object.keys(errors).length !== 0) {
      res.status(400).json({ errors });
      return;
    }

    let dryrun = await ctx.whatsapp.manager.testCredential(
      {
        clientID: req.body.clientID,
        serverToken: req.body.serverToken,
        clientToken: req.body.clientToken,
        encKey: req.body.encKey,
        macKey: req.body.macKey,
      },
      true
    );

    if (dryrun.status !== "OK") {
      res.status(400).json({ errors: [dryrun.status] });
      return;
    }

    await next();
  };

  handler.validate = async (req, res, handler) => {
    req.whatsAppCred = ctx.whatsapp.manager.testCredential({
      clientID: req.body.clientID,
      serverToken: req.body.serverToken,
      clientToken: req.body.clientToken,
      encKey: req.body.encKey,
      macKey: req.body.macKey,
    });

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

      req.whatsAppCred = await req.whatsAppCred;

      switch (req.whatsAppCred.status) {
        case "TIMEOUT":
          res.status(400).json({
            reason: "Connection to WhatsApp Web API timed out",
          });
          return;
        case "ERROR":
          res.status(400).json({
            reason:
              "An error occured while openning a connection to WhatsApp Web API",
            error: req.whatsAppCred.err,
          });
          return;
      }

      if (
        (await PhoneModel.countByColumn(
          trx,
          "jid",
          req.whatsAppCred.result.user.jid
        )) !== 0
      ) {
        res.status(409).json({
          reason: `Phone "+${
            req.whatsAppCred.result.user.jid.split("@")[0]
          }" is already beeing used"`,
        });
        return;
      }

      await handler(req, res);
    });
  };

  return handler;
};

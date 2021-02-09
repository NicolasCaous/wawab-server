"use strict";
const rfr = require("rfr");

const PhoneModel = rfr("src/db/models/Phone");

const StringValidator = rfr("src/validators/string");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    req.phone.auth_client_id = req.whatsAppCred.new_cred
      ? req.whatsAppCred.new_cred.clientID
      : req.body.clientID;
    req.phone.auth_server_token = req.whatsAppCred.new_cred
      ? req.whatsAppCred.new_cred.serverToken
      : req.body.serverToken;
    req.phone.auth_client_token = req.whatsAppCred.new_cred
      ? req.whatsAppCred.new_cred.clientToken
      : req.body.clientToken;
    req.phone.auth_enc_key = req.whatsAppCred.new_cred
      ? req.whatsAppCred.new_cred.encKey
      : req.body.encKey;
    req.phone.auth_mac_key = req.whatsAppCred.new_cred
      ? req.whatsAppCred.new_cred.macKey
      : req.body.macKey;
    req.phone.expired = false;
    req.phone.image_url = req.whatsAppCred.result.user.imgUrl;
    req.phone.jid = req.whatsAppCred.result.user.jid;
    req.phone.uname = req.whatsAppCred.result.user.name;

    await req.phone._save(req.trx, req.user.id);

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

      req.phone = await PhoneModel.getByColumn(
        trx,
        "jid",
        req.whatsAppCred.result.user.jid
      );
      if (req.phone === undefined) {
        res.status(404).json({
          reason: `Phone "+${
            req.whatsAppCred.result.user.jid.split("@")[0]
          }" wasn't registered"`,
        });
        return;
      }

      if (req.phone.user !== req.user.id) {
        if (!req.userRoles.includes("admin")) {
          res.status(403).json({
            reason:
              "A user can't update another user's phone unless the user is an admin",
          });
          return;
        }
      }

      await handler(req, res);
    });
  };

  return handler;
};

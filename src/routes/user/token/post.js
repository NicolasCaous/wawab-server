"use strict";
const rfr = require("rfr");

const ApiToken = rfr("src/db/models/ApiToken");
const Token = rfr("src/db/models/Token");

const random = rfr("src/utils/random");

const { transaction } = require("@slorm/slorm");

// TODO: post for another user as admin
module.exports = (ctx) => {
  const handler = async (req, res) => {
    let token = new Token({
      content: await random(16, "hex"),
      label: `api_token_${req.apiTokenCount + 1}_${req.user.id}`,
    });

    await token._save(req.trx, false, req.user.id);

    let apiToken = new ApiToken({ user: req.user.id, token: token.id });

    await apiToken._save(req.trx, false, req.user.id);

    res.status(200).json({ token: token.content });
  };

  handler.fastValidate = async (req, res, next) => {
    await next();
  };

  handler.validate = async (req, res, handler) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      req.trx = trx;
      req.apiTokenCount = (await ApiToken.howManyByUser(trx, req.user.id)) + 1;

      if (req.apiTokenCount > ctx.apiToken.API_TOKEN_MAX_COUNT) {
        res.status(403).json({
          reason: `Maximum limit of ${ctx.apiToken.API_TOKEN_MAX_COUNT} api tokens reached"`,
        });
        return;
      }

      await handler(req, res);
    });
  };

  return handler;
};

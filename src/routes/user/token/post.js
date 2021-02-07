"use strict";
const rfr = require("rfr");

const ApiTokenModel = rfr("src/db/models/ApiToken");
const TokenModel = rfr("src/db/models/Token");

const random = rfr("src/utils/random");

const { transaction } = require("@slorm/slorm");

// TODO: post for another user as admin
module.exports = (ctx) => {
  const handler = async (req, res) => {
    let token = new TokenModel({
      content: await random(16, "hex"),
      label: `api_token_${req.apiTokenCount + 1}_${req.user.id}`,
    });

    await token._save(req.trx, req.user.id);

    let apiToken = new ApiTokenModel({ user: req.user.id, token: token.id });

    await apiToken._save(req.trx, req.user.id);

    res.status(200).json({ id: apiToken.id, token: token.content });
  };

  handler.fastValidate = async (req, res, next) => {
    await next();
  };

  handler.validate = async (req, res, handler) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      req.trx = trx;
      req.apiTokenCount =
        (await ApiTokenModel.countByColumn(trx, "user", req.user.id)) + 1;

      if (req.apiTokenCount > ctx.limits.MAX_API_TOKENS_PER_USER) {
        res.status(403).json({
          reason: `Maximum limit of ${ctx.limits.MAX_API_TOKENS_PER_USER} api tokens reached"`,
        });
        return;
      }

      await handler(req, res);
    });
  };

  return handler;
};

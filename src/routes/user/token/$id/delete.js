"use strict";
const rfr = require("rfr");

const ApiToken = rfr("src/db/models/ApiToken");
const Token = rfr("src/db/models/Token");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx) => {
  const handler = async (req, res) => {
    await req.apiToken._delete(req.trx, req.user.id);
    await req.token._delete(req.trx, req.user.id);

    res.status(200).json();
  };

  handler.fastValidate = async (req, res, next) => {
    await next();
  };

  handler.validate = async (req, res, handler) => {
    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      req.trx = trx;
      req.token = await Token.getByColumn(trx, "content", req.params.id);

      if (req.token === undefined) {
        res.status(404).json({ reason: `Token ${req.params.id} not found` });
        return;
      }

      req.apiToken = await ApiToken.getByColumn(trx, "token", req.token.id);

      console.log();

      if (req.apiToken.user !== req.user.id) {
        if (!req.userRoles.includes("admin")) {
          res
            .status(403)
            .json({
              reason:
                "A user can't delete another user's token unless the user is an admin",
            });
          return;
        }
      }

      await handler(req, res);
    });
  };

  return handler;
};

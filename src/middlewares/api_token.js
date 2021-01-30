"use strict";
const rfr = require("rfr");

const UserModel = rfr("src/db/models/User");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx, handler) => async (req, res, next) => {
  try {
    let runNext = false;

    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      if (!("authorization" in req.headers)) {
        res.status(401).json({ reason: "Authorization header missing" });
        return;
      }

      if (!req.headers.authorization.toLowerCase().startsWith("bearer ")) {
        res.status(401).json({ reason: "Authorization not a bearer token" });
        return;
      }

      let token = req.headers.authorization.split(" ")[1];

      req.user = await UserModel.getUserByApiToken(trx, token);

      if (req.user === undefined) {
        res.status(401).json({ reason: "Invalid Token" });
        return;
      }

      runNext = true;
    });

    if (runNext) await next();
  } catch (err) {
    await next(err);
  }
};

"use strict";
const rfr = require("rfr");

const UserModel = rfr("src/db/models/User");

const { transaction } = require("@slorm/slorm");

module.exports = (ctx, handler) => async (req, res, next) => {
  try {
    let runNext = false;

    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      let route = `${req.method}:${req.route.path}`;

      if (!(await UserModel.hasPermissionToUseRoute(trx, req.user.id, route))) {
        res.status(403).json({
          reason: `User "${req.user.email}" doesn't have permission to use route "${route}"`,
        });
        return;
      }

      runNext = true;
    });

    if (runNext) await next();
  } catch (err) {
    await next(err);
  }
};

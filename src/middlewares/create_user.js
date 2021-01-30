"use strict";
const rfr = require("rfr");

const UserModel = rfr("src/db/models/User");
const UserRoleModel = rfr("src/db/models/UserRole");
const RoleModel = rfr("src/db/models/Role");

const { transaction } = require("@slorm/slorm");
const axios = require("axios");

module.exports = (ctx, handler) => async (req, res, next) => {
  try {
    let runNext = false;

    await transaction.startTransaction(ctx.db.slonik, async (trx) => {
      req.auth0user = req.user;
      req.user = await UserModel.getUserByAuth0Id(
        trx,
        req.user.sub.split("|")[1]
      );

      if (req.user === undefined) {
        let result = await axios({
          url: `${ctx.auth0.AUTH0_DOMAIN}/userinfo`,
          method: "GET",
          headers: {
            Authorization: req.headers.authorization,
          },
        }).catch((err) => err.response);

        if (result.status !== 200) {
          res.status(result.status).json(result.data);
          return;
        }

        req.auth0data = result.data;
        req.user = new UserModel({
          email: result.data.email,
          gravatar_picture:
            result.data.picture !== undefined ? result.data.picture : null,
          auth0_id: result.data.sub.split("|")[1],
        });

        await req.user._save(trx);

        await new UserRoleModel({
          user: req.user.id,
          role: (await RoleModel.getByLabel(trx, "standard")).id,
        })._save(trx);
      }

      runNext = true;
    });

    if (runNext) await next();
  } catch (err) {
    await next(err);
  }
};

"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { VarCharField } = require("@slorm/slorm");

class UserModel extends BaseModel {
  static tableName = sql`user`;

  static email = new VarCharField({ unique: true });
  static gravatar_picture = new VarCharField({ null: true });
  static auth0_id = new VarCharField({ unique: true });

  static async getUserByApiToken(trx, api_token) {
    let result = await trx.query(sql`SELECT u.* FROM ${this.getTableName()} u
                                      INNER JOIN "api_token" apit ON apit."user" = u."id"
                                      INNER JOIN "token" t on apit."token" = t."id"
                                     WHERE t."content" = ${api_token}`);

    if (result.rowCount === 0) return undefined;

    return new this(result.rows[0]);
  }

  static async hasPermissionToUseRoute(trx, user_id, route) {
    return (
      (
        await trx.query(
          sql`SELECT COUNT(*) FROM ${this.getTableName()} u
                INNER JOIN "user_role" ur ON ur."user" = u."id"
                INNER JOIN "role" r ON ur."role" = r."id"
                INNER JOIN "role_permission" rp ON rp."role" = r."id"
                INNER JOIN "permission" p ON rp."permission" = p."id"
              WHERE u."id" = ${user_id}
                AND p."path" = ${route}`
        )
      ).rows[0].count === 1
    );
  }
}

UserModel.setUpHistory();

module.exports = UserModel;

"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { VarCharField } = require("@slorm/slorm");

class RoleModel extends BaseModel {
  static tableName = sql`role`;

  static label = new VarCharField({ unique: true });

  static async listByUser(trx, user_id) {
    let tokens = (
      await trx.query(sql`SELECT r.* FROM ${this.getTableName()} r
                            INNER JOIN "user_role" ur ON ur."role" = r."id"
                            INNER JOIN "user" u ON ur."user" = u."id"
                          WHERE u."id" = ${user_id}`)
    ).rows;

    return tokens.map((x) => new this(x));
  }
}

RoleModel.setUpHistory();

module.exports = RoleModel;

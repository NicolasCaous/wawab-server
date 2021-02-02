"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { TimestampField, VarCharField } = require("@slorm/slorm");

class TokenModel extends BaseModel {
  static tableName = sql`token`;

  static content = new VarCharField();
  static label = new VarCharField({ unique: true });
  static valid_until = new TimestampField({ null: true });

  static async listByUser(trx, user_id) {
    let tokens = (
      await trx.query(sql`SELECT t.* FROM ${this.getTableName()} t
                            INNER JOIN "api_token" apit ON apit."token" = t."id"
                            INNER JOIN "user" u ON apit."user" = u."id"
                          WHERE u."id" = ${user_id}`)
    ).rows;

    return tokens.map((x) => new this(x));
  }
}

TokenModel.setUpHistory();

module.exports = TokenModel;

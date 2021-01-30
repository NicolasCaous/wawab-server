"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");
const TokenModel = rfr("src/db/models/Token");
const UserModel = rfr("src/db/models/User");

const { sql } = require("slonik");
const { ForeignKeyField } = require("@slorm/slorm");

class ApiTokenModel extends BaseModel {
  static tableName = sql`api_token`;

  static token = new ForeignKeyField({
    table: TokenModel,
    column: "id",
    unique: true,
  });
  static user = new ForeignKeyField({ table: UserModel, column: "id" });

  static async howManyByUser(trx, user_id) {
    return (
      await trx.query(
        sql`SELECT COUNT(*) FROM ${this.getTableName()}
              WHERE "user" = ${user_id}`
      )
    ).rows[0].count;
  }
}

ApiTokenModel.setUpHistory();

module.exports = ApiTokenModel;

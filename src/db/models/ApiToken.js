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

  static async listByUser(trx, user_id) {
    let tokens = (
      await trx.query(sql`SELECT at.* FROM ${this.getTableName()} at
                            INNER JOIN "user" u ON at."user" = u."id"
                          WHERE u."id" = ${user_id}`)
    ).rows;

    return tokens.map((x) => new this(x));
  }
}

ApiTokenModel.setUpHistory();

module.exports = ApiTokenModel;

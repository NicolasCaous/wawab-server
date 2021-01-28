"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");
const UserModel = rfr("src/db/models/User");

const { sql } = require("slonik");
const { ForeignKeyField, VarCharField } = require("@slorm/slorm");

class TokenModel extends BaseModel {
  static tableName = sql`token`;

  static user = new ForeignKeyField({ table: UserModel, column: "id" });
  static label = new VarCharField();
  static content = new VarCharField();
}

TokenModel.setUpHistory();

module.exports = TokenModel;

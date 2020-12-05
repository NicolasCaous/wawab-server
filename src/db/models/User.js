"use strict";
const rfr = require("rfr");

const { sql } = require("slonik");

const BaseModel = rfr("src/db/models/Base");
const VarCharField = rfr("src/utils/slorm/fields/VarCharField");

class UserModel extends BaseModel {
  static tableName = sql`user`;

  static uname = new VarCharField({ null: true });
}

module.exports = UserModel;

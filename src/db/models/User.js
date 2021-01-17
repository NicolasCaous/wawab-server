"use strict";
const rfr = require("rfr");

const { sql } = require("slonik");

const BaseModel = rfr("src/db/models/Base");
const { VarCharField } = require("@slorm/slorm");

class UserModel extends BaseModel {
  static tableName = sql`user`;

  static uname = new VarCharField({ null: true });
}

UserModel.setUpHistory();

module.exports = UserModel;

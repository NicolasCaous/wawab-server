"use strict";
const rfr = require("rfr");

const { sql } = require("slonik");

const BaseHistoricModel = rfr("src/db/models/base");
const VarCharField = rfr("src/utils/slorm/fields/VarCharField");

class UserModel extends BaseHistoricModel {
  static tableName = sql`user`;

  static uname = new VarCharField({ null: true });
}

module.exports = UserModel;

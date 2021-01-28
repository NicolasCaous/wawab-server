"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { VarCharField } = require("@slorm/slorm");

class RoleModel extends BaseModel {
  static tableName = sql`role`;

  static label = new VarCharField({ unique: true });
}

RoleModel.setUpHistory();

module.exports = RoleModel;

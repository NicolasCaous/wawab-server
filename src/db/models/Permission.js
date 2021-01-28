"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { VarCharField } = require("@slorm/slorm");

class PermissionModel extends BaseModel {
  static tableName = sql`permission`;

  static path = new VarCharField({ unique: true });
}

PermissionModel.setUpHistory();

module.exports = PermissionModel;

"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");
const PermissionModel = rfr("src/db/models/Permission");
const RoleModel = rfr("src/db/models/Role");

const { sql } = require("slonik");
const { SlormConstraint, ForeignKeyField } = require("@slorm/slorm");

class RolePermissionModel extends BaseModel {
  static tableName = sql`role_permission`;

  static permission = new ForeignKeyField({
    table: PermissionModel,
    column: "id",
  });
  static role = new ForeignKeyField({ table: RoleModel, column: "id" });

  static role_permission_unique_constraint = new SlormConstraint({
    unique: [sql`permission`, sql`role`],
  });
}

RolePermissionModel.setUpHistory();

module.exports = RolePermissionModel;

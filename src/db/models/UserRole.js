"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");
const RoleModel = rfr("src/db/models/Role");
const UserModel = rfr("src/db/models/User");

const { sql } = require("slonik");
const { SlormConstraint, ForeignKeyField } = require("@slorm/slorm");

class UserRoleModel extends BaseModel {
  static tableName = sql`user_role`;

  static role = new ForeignKeyField({ table: RoleModel, column: "id" });
  static user = new ForeignKeyField({ table: UserModel, column: "id" });

  static user_role_unique_constraint = new SlormConstraint({
    unique: [sql`role`, sql`user`],
  });
}

UserRoleModel.setUpHistory();

module.exports = UserRoleModel;

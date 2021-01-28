"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { VarCharField } = require("@slorm/slorm");

class UserModel extends BaseModel {
  static tableName = sql`user`;

  static email = new VarCharField({ unique: true });
  static gravatar_picture = new VarCharField({ null: true });
  static auth0_id = new VarCharField();
}

UserModel.setUpHistory();

module.exports = UserModel;

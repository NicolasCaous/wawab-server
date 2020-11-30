"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/base");

const { sql } = require("slonik");

class UserModel extends BaseModel {
  static columns = {
    id: {
      type: sql`uuid`,
      null: false,
      primaryKey: false,
      unique: false,
    },
  };

  static tableName = "user_name";
}

module.exports = UserModel;

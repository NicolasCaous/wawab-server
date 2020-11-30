"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/base");

const { sql } = require("slonik");

class UserModel extends BaseModel {
  static tableName = sql`user`;
}

module.exports = UserModel;

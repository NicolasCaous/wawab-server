"use strict";
const rfr = require("rfr");

const { sql } = require("slonik");

const BaseModel = rfr("src/db/models/Base");
const UserModel = rfr("src/db/models/User");
const ForeignKeyField = rfr("src/utils/slorm/fields/ForeignKeyField");

class TweetModel extends BaseModel {
  static tableName = sql`tweet`;

  static user = new ForeignKeyField({
    null: true,
    table: UserModel,
    column: "id",
  });
}

TweetModel.setUpHistory();

module.exports = TweetModel;

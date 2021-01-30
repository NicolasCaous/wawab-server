"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { TimestampField, VarCharField } = require("@slorm/slorm");

class TokenModel extends BaseModel {
  static tableName = sql`token`;

  static content = new VarCharField();
  static label = new VarCharField({ unique: true });
  static valid_until = new TimestampField({ null: true });
}

TokenModel.setUpHistory();

module.exports = TokenModel;

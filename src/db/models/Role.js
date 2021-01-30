"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");

const { sql } = require("slonik");
const { VarCharField } = require("@slorm/slorm");

class RoleModel extends BaseModel {
  static tableName = sql`role`;

  static label = new VarCharField({ unique: true });

  static async getByLabel(trx, label) {
    let result = await trx.query(sql`SELECT * FROM ${this.getTableName()}
                                     WHERE label = ${label}`);

    if (result.rowCount === 0) return undefined;

    return new this(result.rows[0]);
  }
}

RoleModel.setUpHistory();

module.exports = RoleModel;

"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");
const PhoneModel = rfr("src/db/models/Phone");

const { sql } = require("slonik");
const { ForeignKeyField, VarCharField } = require("@slorm/slorm");

class OTPModel extends BaseModel {
  static tableName = sql`otp`;

  static code = new VarCharField();
  static message = new VarCharField();
  static receiver = new VarCharField();
  static sender = new ForeignKeyField({ table: PhoneModel, column: "id" });
  static status = new VarCharField();

  static async listBySenderAndReceiver(trx, sender, receiver) {
    let result = await trx.query(sql`SELECT * FROM ${this.getTableName()}
                                     WHERE "sender" = ${sender}
                                       AND "receiver" = ${receiver}
                                     ORDER BY "created_at" DESC`);

    return result.rows.map((x) => new this(x));
  }
}

OTPModel.setUpHistory();

module.exports = OTPModel;

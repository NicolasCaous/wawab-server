"use strict";
const rfr = require("rfr");

const BaseModel = rfr("src/db/models/Base");
const UserModel = rfr("src/db/models/User");

const { sql } = require("slonik");
const { ForeignKeyField, VarCharField } = require("@slorm/slorm");

class PhoneModel extends BaseModel {
  static tableName = sql`phone`;

  static auth_client_id = new VarCharField();
  static auth_server_token = new VarCharField();
  static auth_client_token = new VarCharField();
  static auth_enc_key = new VarCharField();
  static auth_mac_key = new VarCharField();

  static image_url = new VarCharField();
  static jid = new VarCharField({ unique: true });
  static uname = new VarCharField();
  static user = new ForeignKeyField({ table: UserModel, column: "id" });

  static async listByUser(trx, user_id) {
    let phones = (
      await trx.query(sql`SELECT p.* FROM ${this.getTableName()} p
                            INNER JOIN "user" u ON p."user" = u."id"
                          WHERE u."id" = ${user_id}`)
    ).rows;

    return phones.map((x) => new this(x));
  }
}

PhoneModel.setUpHistory();

module.exports = PhoneModel;

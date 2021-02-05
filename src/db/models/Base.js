"use strict";

const { HistoricScaffoldModel } = require("@slorm/slorm");
const { sql } = require("slonik");

class BaseModel extends HistoricScaffoldModel {
  static async countByColumn(trx, column, value) {
    return (
      await trx.query(
        sql`SELECT COUNT(*) FROM ${this.getTableName()}
            WHERE ${sql.identifier([column])} = ${value}`
      )
    ).rows[0].count;
  }

  static async getById(trx, id) {
    return await this.getByColumn(trx, "id", id);
  }

  static async getByColumn(trx, column, value) {
    let result = await trx.query(sql`SELECT * FROM ${this.getTableName()}
                                     WHERE ${sql.identifier([
                                       column,
                                     ])} = ${value}`);

    if (result.rowCount === 0) return undefined;

    return new this(result.rows[0]);
  }
}

module.exports = BaseModel;

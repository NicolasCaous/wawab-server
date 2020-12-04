"use strict";
const rfr = require("rfr");

const uuid = require("uuid");

const joinSqlTemplates = rfr("src/utils/slonik/join_sql_templates");
const SlormField = rfr("src/utils/slorm/fields/SlormField");
const SlormModel = rfr("src/utils/slorm/SlormModel");
const UUIDField = rfr("src/utils/slorm/fields/UUIDField");

class BaseHistoricModel extends SlormModel {
  #dbTruth;

  static id = new UUIDField({
    default: uuid.v4,
    primaryKey: true,
  });

  async _save(trx) {
    let newRow = this.id === undefined;

    if (this.id !== undefined) {
      let result = await trx.query(
        joinSqlTemplates(
          [
            sql`SELECT * FROM`,
            sql`${this.constructor.getTableName()}`,
            sql`WHERE "id" =`,
            sql`${this.constructor.id.constructor.toDb(this.id)}`,
          ],
          sql` `
        )
      );

      newRow = result.rowCount === 0;

      if (!newRow) {
        this.#dbTruth = {};
        for (let attr in result.rows[0]) {
          this.#dbTruth[attr] = this.constructor[attr].constructor.fromDb(
            result.rows[0][attr]
          );
        }
      }
    }

    if (newRow) {
      let columns = [];
      for (let attr in this.constructor) {
        if (this.constructor[attr] instanceof SlormField) {
          let value = this[attr];

          if (
            value === undefined &&
            typeof this.constructor[attr].default === "function"
          ) {
            value = await this.constructor[attr].default(this);
          }

          if (value !== undefined)
            columns.push([
              attr,
              this.constructor[attr].columnName !== undefined
                ? this.constructor[attr].columnName
                : sql`${sql.identifier([attr])}`,
              value,
              this.constructor[attr].constructor.toDb,
            ]);
        }
      }

      await trx.query(
        joinSqlTemplates(
          [
            sql`INSERT INTO ${this.constructor.getTableName()} (`,
            joinSqlTemplates(
              columns.map((x) => x[1]),
              sql`, `
            ),
            sql`) VALUES (`,
            joinSqlTemplates(
              columns.map((x) => x[3](x[2])),
              sql`, `
            ),
            sql`)`,
          ],
          sql` `
        )
      );

      for (let i in columns) {
        let attr = columns[i][0];
        let value = columns[i][2];
        if (
          this[attr] === undefined &&
          typeof this.constructor[attr].default === "function"
        ) {
          this[attr] = value;
        }
      }

      return true;
    } else {
      let columns = [];
      for (let attr in this.constructor) {
        if (this.constructor[attr] instanceof SlormField) {
          let value = this[attr];
          value = value === undefined ? null : value;

          if (value !== this.#dbTruth[attr]) {
            columns.push([
              attr,
              this.constructor[attr].columnName !== undefined
                ? this.constructor[attr].columnName
                : sql`${sql.identifier([attr])}`,
              value,
              this.constructor[attr].constructor.toDb,
            ]);
          }
        }
      }

      if (columns.length === 0) return false;

      await trx.query(
        joinSqlTemplates(
          [
            sql`UPDATE ${this.constructor.getTableName()} SET`,
            joinSqlTemplates(
              columns.map((x) => sql`${x[1]} = ${x[3](x[2])}`),
              sql`, `
            ),
            sql`WHERE "id" =`,
            sql`${this.constructor.id.constructor.toDb(this.id)}`,
          ],
          sql` `
        )
      );

      return true;
    }
  }

  /*{
    command: 'SELECT',
    fields: [ { dataTypeId: 2950, name: 'id' } ],
    notices: [],
    rowCount: 2,
    rows: [
      { id: '23aaf121-b80b-48ba-aec8-66a3a320e9b8' },
      { id: '2e154826-b66d-4b18-a7fe-697fb51dd12d' }
    ]
  }*/
}

/*
const nameIt = (name, cls) => ({[name] : class extends cls {}})[name];

class Dummy {};

const NamedDummy = nameIt('NamedDummy', Dummy);
const NamedDummyMore = nameIt('NamedDummyMore', class {});

console.log('Here are the classes:');
console.log(Dummy);
console.log(NamedDummy);
console.log(NamedDummyMore);

const dummy = new Dummy();
const namedDummy = new NamedDummy();
const namedDummyMore = new NamedDummyMore();


console.log('\nHere are the objects:');
console.log(dummy);
console.log(namedDummy);
console.log(namedDummyMore);
*/

module.exports = BaseHistoricModel;

"use strict";
const rfr = require("rfr");

const joinSqlTemplates = rfr("src/utils/slonik/join_sql_templates");
const SlormConstraint = rfr("src/utils/slorm/constraints/SlormConstraint");
const SlormField = rfr("src/utils/slorm/fields/SlormField");

const { sql } = require("slonik");

class SlormModel {
  static tableName;

  static getTableName() {
    let tableName = this.tableName;
    if (tableName === undefined)
      tableName = sql`${sql.identifier([this.name])}`;

    assert(
      typeof tableName === "object" &&
        "type" in tableName &&
        tableName.type === "SLONIK_TOKEN_SQL",
      "tableName must be a slonik sql template"
    );
    if (tableName.sql[0] !== '"' || tableName.sql.substr(-1) !== '"') {
      tableName = sql`${sql.identifier([tableName.sql])}`;
    }

    return tableName;
  }

  static toSQL() {
    let columns = [];
    let constraints = [];

    for (let attr in this)
      if (this[attr] instanceof SlormField) columns.push(attr);
      else if (this[attr] instanceof SlormConstraint) constraints.push(attr);

    columns = joinSqlTemplates(
      columns.map((attr) => this[attr].toSQL(sql`${sql.identifier([attr])}`)),
      sql`, `
    );
    constraints = joinSqlTemplates(
      constraints.map((attr) =>
        this[attr].toSQL(sql`${sql.identifier([attr])}`)
      ),
      sql`, `
    );

    return sql`CREATE TABLE ${this.getTableName()} ( ${joinSqlTemplates(
      [columns, constraints],
      sql`, `
    )} )`;
  }
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

module.exports = SlormModel;

"use strict";
const rfr = require("rfr");

const joinSqlTemplates = rfr("src/utils/slonik/join_sql_templates");

const { sql } = require("slonik");

class SlormModel {
  static tableName;

  static validateModel(cls) {
    assert(
      typeof cls.tableName === "string" && cls.tableName.length > 3,
      `static tableName "${cls.tableName}" must be a string with length > 3`
    );

    for (let name in cls.columns) {
      assert("type" in cls.columns[name]);

      if ("primaryKey" in cls.columns[name])
        assert(typeof cls.columns[name].primaryKey === "boolean");

      if ("null" in cls.columns[name])
        assert(typeof cls.columns[name].null === "boolean");

      if ("unique" in cls.columns[name])
        assert(typeof cls.columns[name].unique === "boolean");
    }
  }

  static async startTransaction(cls, slonik, handler) {
    await slonik.connect(
      async (conn) =>
        await conn.transaction(async (trx) => {
          await trx.query(sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`);
          await handler(cls, trx);
        })
    );
  }

  static async createTable(cls, trx) {
    cls.validateModel(cls);

    let queryLines = [];
    let constraints = [];
    let primaryKeys = [];

    for (let name in cls.columns) {
      let queryColumn = sql`${sql.identifier([name.trim()])}`;
      queryColumn = sql`${queryColumn} ${cls.columns[name].type}`;

      if (
        "primaryKey" in cls.columns[name] &&
        cls.columns[name].primaryKey === true
      )
        primaryKeys.push(
          sql`${sql.identifier([cls.columns[name].name.trim()])}`
        );

      if ("null" in cls.columns[name] && cls.columns[name].null === false)
        queryColumn = sql`${queryColumn} NOT NULL`;

      if ("unique" in cls.columns[name] && cls.columns[name].unique === true)
        queryColumn = sql`${queryColumn} UNIQUE`;

      queryLines.push(queryColumn);
    }

    if (primaryKeys.length > 0)
      constraints.push(
        sql`CONSTRAINT primary_key PRIMARY KEY (${joinSqlTemplates(
          primaryKeys,
          sql`, `
        )})`
      );

    queryLines = joinSqlTemplates(queryLines.concat(constraints), sql`, `);

    console.log(
      sql`CREATE TABLE ${sql.identifier([
        cls.tableName.trim(),
      ])} (${queryLines})`
    );
    await trx.query(
      sql`CREATE TABLE ${sql.identifier([
        cls.tableName.trim(),
      ])} (${queryLines})`
    );
  }

  static async dropTable(cls, trx) {
    await trx.query(sql`DROP TABLE ${sql.identifier(cls.tableName)}`);
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

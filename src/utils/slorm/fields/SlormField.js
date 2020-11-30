"use strict";

const assert = require("assert");
const { sql } = require("slonik");

class SlormField {
  constructor(args) {
    assert(typeof args === "object", "args must be an object");

    this.sqlType = "sqlType" in args ? args.sqlType : undefined;
    this.notNull = "notNull" in args ? args.notNull : true;
    this.index = "index" in args ? args.index : false;
    this.unique = "unique" in args ? args.unique : false;
    this.columnName = "columnName" in args ? args.columnName : undefined;
    this.defaultValue = "defaultValue" in args ? args.defaultValue : undefined;
    this.primaryKey = "primaryKey" in args ? args.primaryKey : false;
    this.constraints = "constraints" in args ? args.constraints : [];
    this.collation = "collation" in args ? args.collation : undefined;
    this.indexType = "indexType" in args ? args.indexType : undefined;
    this.description = "description" in args ? args.description : undefined;

    assert(typeof this.notNull === "boolean", "notNull must be a boolean");
    assert(typeof this.index === "boolean", "index must be a boolean");
    assert(typeof this.unique === "boolean", "unique must be a boolean");
    if (this.columnName !== undefined)
      assert(
        typeof this.columnName === "object" &&
          "type" in this.columnName &&
          this.columnName.type === "SLONIK_TOKEN_SQL",
        "columnName must be a slonik sql template and must not be undefined"
      );
    if (this.defaultValue !== undefined)
      assert(
        (typeof this.defaultValue === "object" &&
          "type" in this.defaultValue &&
          this.defaultValue.type === "SLONIK_TOKEN_SQL") ||
          typeof this.defaultValue === "function",
        "defaultValue must be a slonik sql template or a function"
      );
    assert(
      typeof this.primaryKey === "boolean",
      "primaryKey must be a boolean"
    );
    assert(
      this.constraints instanceof Array &&
        this.constraints.every(
          (constraint) =>
            typeof constraint === "object" &&
            "type" in constraint &&
            constraint.type === "SLONIK_TOKEN_SQL"
        ),
      "constraints must be a list of slonik sql templates"
    );
    if (this.collation !== undefined)
      assert(
        typeof this.collation === "object" &&
          "type" in this.collation &&
          this.collation.type === "SLONIK_TOKEN_SQL",
        "collation must be a slonik sql template"
      );
    if (this.indexType !== undefined)
      assert(
        typeof this.indexType === "object" &&
          "type" in this.indexType &&
          this.indexType.type === "SLONIK_TOKEN_SQL" &&
          ["BRIN", "GIN"].includes(this.indexType.sql),
        "indexType must be a slonik sql template and must be either BRIN or GIN"
      );
    if (this.description !== undefined)
      assert(
        typeof this.description === "object" &&
          "type" in this.description &&
          this.description.type === "SLONIK_TOKEN_SQL",
        "description must be a slonik sql template"
      );

    assert(
      this.sqlType !== undefined &&
        typeof this.sqlType === "object" &&
        "type" in this.sqlType &&
        this.sqlType.type === "SLONIK_TOKEN_SQL",
      "Slorm fields must have a sqlType attribute that is a slonik sql template"
    );
  }

  toSQL(columnName) {
    if (this.columnName !== undefined) columnName = this.columnName;

    return sql`${columnName} ${this.sqlType}${
      this.primaryKey ? sql` PRIMARY KEY` : sql``
    }${this.notNull ? sql` NOT NULL` : sql``}${
      this.unique ? sql` UNIQUE` : sql``
    }`;
  }
}

module.exports = SlormField;

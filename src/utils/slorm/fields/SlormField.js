"use strict";
const rfr = require("rfr");

const joinSqlTemplates = rfr("src/utils/slonik/join_sql_templates");

const assert = require("assert");
const { sql } = require("slonik");

class SlormField {
  constructor(args) {
    assert(typeof args === "object", "args must be an object");

    this.columnName = "columnName" in args ? args.columnName : undefined;
    if (this.columnName !== undefined)
      assert(
        typeof this.columnName === "object" &&
          "type" in this.columnName &&
          this.columnName.type === "SLONIK_TOKEN_SQL",
        "columnName must be a slonik sql template and must not be undefined"
      );

    this.sqlType = "sqlType" in args ? args.sqlType : undefined;
    assert(
      this.sqlType !== undefined &&
        typeof this.sqlType === "object" &&
        "type" in this.sqlType &&
        this.sqlType.type === "SLONIK_TOKEN_SQL",
      "Slorm fields must have a sqlType attribute that is a slonik sql template"
    );

    this.collation = "collation" in args ? args.collation : undefined;
    if (this.collation !== undefined)
      assert(
        typeof this.collation === "object" &&
          "type" in this.collation &&
          this.collation.type === "SLONIK_TOKEN_SQL",
        "collation must be a slonik sql template"
      );

    this.null = "null" in args ? args.null : false;
    assert(typeof this.null === "boolean", "null must be a boolean");

    this.check = "check" in args ? args.check : undefined;
    if (this.check !== undefined)
      assert(
        typeof this.check === "object" &&
          "type" in this.check &&
          this.check.type === "SLONIK_TOKEN_SQL",
        "check must be a slonik sql template"
      );

    this.checkNoInherit =
      "checkNoInherit" in args ? args.checkNoInherit : false;
    assert(
      typeof this.checkNoInherit === "boolean",
      "checkNoInherit must be a boolean"
    );

    this.default = "default" in args ? args.default : undefined;
    if (this.default !== undefined)
      assert(
        (typeof this.default === "object" &&
          "type" in this.default &&
          this.default.type === "SLONIK_TOKEN_SQL") ||
          typeof this.default === "function",
        "default must be a slonik sql template or a function"
      );

    this.generatedStored =
      "generatedStored" in args ? args.generatedStored : undefined;
    if (this.generatedStored !== undefined)
      assert(
        typeof this.generatedStored === "object" &&
          "type" in this.generatedStored &&
          this.generatedStored.type === "SLONIK_TOKEN_SQL",
        "generatedStored must be a slonik sql template"
      );

    this.generatedAsIdentity =
      "generatedAsIdentity" in args ? args.generatedAsIdentity : undefined;
    if (this.generatedAsIdentity !== undefined)
      assert(
        typeof this.generatedAsIdentity === "object" &&
          "type" in this.generatedAsIdentity &&
          this.generatedAsIdentity.type === "SLONIK_TOKEN_SQL" &&
          ["ALWAYS", "BY DEFAULT"].includes(this.generatedAsIdentity.sql),
        "generatedAsIdentity must be a slonik sql template and can only be 'ALWAYS' or 'BY DEFAULT'"
      );

    this.generatedAsIdentitySequenceOptions =
      "generatedAsIdentitySequenceOptions" in args
        ? args.generatedAsIdentitySequenceOptions
        : undefined;
    if (this.generatedAsIdentitySequenceOptions !== undefined)
      assert(
        typeof this.generatedAsIdentitySequenceOptions === "object" &&
          "type" in this.generatedAsIdentitySequenceOptions &&
          this.generatedAsIdentitySequenceOptions.type === "SLONIK_TOKEN_SQL",
        "generatedAsIdentitySequenceOptions must be a slonik sql template"
      );

    assert(
      (this.generatedStored === undefined &&
        this.generatedAsIdentity === undefined) ||
        ((this.default === undefined || typeof this.default === "function") &&
          this.generatedAsIdentity === undefined) ||
        ((this.default === undefined || typeof this.default === "function") &&
          this.generatedStored === undefined),
      "default, generatedStored and generatedAsIdentity can only be defined alone"
    );

    this.unique = "unique" in args ? args.unique : false;
    assert(
      typeof this.unique === "boolean" ||
        (typeof this.unique === "object" &&
          "type" in this.unique &&
          this.unique.type === "SLONIK_TOKEN_SQL"),
      "unique must be a boolean or an slonik sql template"
    );

    this.primaryKey = "primaryKey" in args ? args.primaryKey : false;
    assert(
      typeof this.primaryKey === "boolean" ||
        (typeof this.primaryKey === "object" &&
          "type" in this.primaryKey &&
          this.primaryKey.type === "SLONIK_TOKEN_SQL"),
      "primaryKey must be a boolean or an slonik sql template"
    );
  }

  /*
  https://www.postgresql.org/docs/current/sql-createtable.html

  { column_name data_type [ COLLATE collation ] [ column_constraint [ ... ] ] }

  where column_constraint is:

  [ CONSTRAINT constraint_name ]
  { NOT NULL |
    NULL |
    CHECK ( expression ) [ NO INHERIT ] |
    DEFAULT default_expr |
    GENERATED ALWAYS AS ( generation_expr ) STORED |
    GENERATED { ALWAYS | BY DEFAULT } AS IDENTITY [ ( sequence_options ) ] |
    UNIQUE index_parameters |
    PRIMARY KEY index_parameters |
    REFERENCES reftable [ ( refcolumn ) ] [ MATCH FULL | MATCH PARTIAL | MATCH SIMPLE ]
      [ ON DELETE referential_action ] [ ON UPDATE referential_action ] }
  [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]

  index_parameters in UNIQUE, PRIMARY KEY, and EXCLUDE constraints are:

  [ WITH ( storage_parameter [= value] [, ... ] ) ]
  [ USING INDEX TABLESPACE tablespace_name ]

  referential_action:

  NO ACTION
  RESTRICT
  CASCADE
  SET NULL
  SET DEFAULT
  */
  toSQL(columnName) {
    if (this.columnName !== undefined) columnName = this.columnName;

    return joinSqlTemplates(
      [
        sql`${columnName}`,
        sql`${this.sqlType}`,
        sql`${
          this.collation !== undefined ? sql`COLLATE ${this.collation}` : sql``
        }`,
        sql`${this.null ? sql`NULL` : sql`NOT NULL`}`,
        sql`${
          this.check
            ? joinSqlTemplates(
                [
                  sql`CHECK ( ${this.check} )`,
                  sql`${this.checkNoInherit ? sql`NO INHERIT` : sql``}`,
                ],
                sql` `
              )
            : sql``
        }`,
        sql`${
          typeof this.default === "object"
            ? sql`DEFAULT ${this.default}`
            : sql``
        }`,
        sql`${
          this.generatedStored !== undefined
            ? sql`GENERATED ALWAYS AS ( ${this.generatedStored} ) STORED`
            : sql``
        }`,
        sql`${
          this.generatedAsIdentity !== undefined
            ? joinSqlTemplates(
                [
                  sql`GENERATED ${this.generatedAsIdentity} AS IDENTITY`,
                  sql`${
                    this.generatedAsIdentitySequenceOptions !== undefined
                      ? sql`( ${this.generatedAsIdentitySequenceOptions} )`
                      : sql``
                  }`,
                ],
                sql` `
              )
            : sql``
        }`,
        sql`${
          this.unique !== false
            ? joinSqlTemplates(
                [
                  sql`UNIQUE`,
                  sql`${
                    typeof this.unique === "object"
                      ? sql`${this.unique}`
                      : sql``
                  }`,
                ],
                sql` `
              )
            : sql``
        }`,
        sql`${
          this.primaryKey !== false
            ? joinSqlTemplates(
                [
                  sql`PRIMARY KEY`,
                  sql`${
                    typeof this.primaryKey === "object"
                      ? sql`${this.primaryKey}`
                      : sql``
                  }`,
                ],
                sql` `
              )
            : sql``
        }`,
      ],
      sql` `
    );
  }
}

module.exports = SlormField;

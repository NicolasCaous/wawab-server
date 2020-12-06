"use strict";
const rfr = require("rfr");

const assert = require("assert");
const { sql } = require("slonik");
const moment = require("moment-timezone");

const SlormField = rfr("src/utils/slorm/fields/SlormField");

class TimestampField extends SlormField {
  constructor(args) {
    super({ sqlType: sql`timestamptz`, ...args });
  }

  fromDb(value) {
    if (value === undefined || value === null) return null;
    return new Date(value);
  }

  toDb(value) {
    if (value === undefined || value === null) return sql`${null}`;

    assert(value instanceof Date, "value must be a date object");

    return sql`${moment.utc(value).format("YYYY-MM-DD HH:mm:ss.SSS UTC")}`;
  }

  isDifferent(a, b) {
    if ((a === undefined || a === null) && (b === undefined || b === null))
      return false;
    if (a === undefined || b === undefined) return true;
    if (a === null || b === null) return true;
    assert(
      a instanceof Date && b instanceof Date,
      "values must be a date object"
    );
    return a.getTime() !== b.getTime();
  }
}

module.exports = TimestampField;

"use strict";

const { sql } = require("slonik");
const SlormField = rfr("src/utils/slorm/fields/SlormField");

class UUIDField extends SlormField {
  constructor(args) {
    super({ sqlType: sql`uuid`, ...args });
  }
}

module.exports = UUIDField;

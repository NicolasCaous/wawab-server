"use strict";

const { sql } = require("slonik");

module.exports = (array, separator = sql``) => {
  if (array.length > 0) return sql`${sql.join(array, separator)}`;
  else return sql``;
};

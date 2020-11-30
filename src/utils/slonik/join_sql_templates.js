"use strict";

const { sql } = require("slonik");

module.exports = (array, separator = sql``) => {
  return array.length > 0
    ? sql`${sql.join(
        array.filter((x) => x.sql !== ""),
        separator
      )}`
    : sql``;
};

"use strict";

const assert = require("assert");

module.exports = (value, rules) => {
  let errors = [];

  if (typeof value !== "string")
    return [`Value "${value}" (${typeof value}) must be a string`];

  if ("max" in rules) {
    assert(
      typeof rules.max === "number",
      `Max rule "${rules.max}" (${typeof rules.max}) must be a number`
    );

    if (value.length > rules.max)
      errors.push(
        `Value "${value}" length (${value.length}) must be at most ${rules.max}`
      );
  }

  if ("min" in rules) {
    assert(
      typeof rules.min === "number",
      `Max rule "${rules.min}" (${typeof rules.min}) must be a number`
    );

    if (value.length < rules.min)
      errors.push(
        `Value "${value}" length (${value.length}) must be at least ${rules.min}`
      );
  }

  if ("regex" in rules) {
    assert(
      rules.regex instanceof RegExp,
      `Regex rule "${
        rules.regex
      }", (${typeof rules.regex}) must be an instance of RegExp`
    );

    if (!rules.regex.test(value))
      errors.push(`Value "${value}" failed regex "${rules.regex}"`);
  }

  return errors;
};

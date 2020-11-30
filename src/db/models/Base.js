"use strict";
const rfr = require("rfr");

const SlormModel = rfr("src/utils/slorm/base");
const UUIDField = rfr("src/utils/slorm/fields/UUIDField");

class BaseModel extends SlormModel {
  static id = new UUIDField({
    primaryKey: true,
  });
}

module.exports = BaseModel;

"use strict";
const rfr = require("rfr");

const SlormModel = rfr("src/utils/slorm/base");
const SlormConstraint = rfr("src/utils/slorm/constraints/SlormConstraint");
const UUIDField = rfr("src/utils/slorm/fields/UUIDField");

class BaseModel extends SlormModel {
  static id = new UUIDField({
    primaryKey: true,
  });

  static id_constraint = new SlormConstraint({ unique: [sql`id`] });
}

module.exports = BaseModel;

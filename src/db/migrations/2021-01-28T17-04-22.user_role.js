"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const UserRoleModel = rfr("src/db/models/UserRole");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(UserRoleModel.toSQL()[0]);
    await trx.query(UserRoleModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${UserRoleModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${UserRoleModel._history.getTableName()};`);
  });

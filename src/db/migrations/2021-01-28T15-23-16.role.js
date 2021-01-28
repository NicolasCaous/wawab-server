"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const RoleModel = rfr("src/db/models/Role");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(RoleModel.toSQL()[0]);
    await trx.query(RoleModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${RoleModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${RoleModel._history.getTableName()};`);
  });

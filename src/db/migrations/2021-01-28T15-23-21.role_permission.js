"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const RolePermissionModel = rfr("src/db/models/RolePermission");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(RolePermissionModel.toSQL()[0]);
    await trx.query(RolePermissionModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${RolePermissionModel.getTableName()};`);
    await trx.query(
      sql`DROP TABLE ${RolePermissionModel._history.getTableName()};`
    );
  });

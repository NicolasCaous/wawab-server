"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const PermissionModel = rfr("src/db/models/Permission");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(PermissionModel.toSQL()[0]);
    await trx.query(PermissionModel.toSQL()[1]);

    let permissions = ["/aff", "/oi"];

    let promises = [];

    for (let i in permissions) {
      let permission = new PermissionModel({ path: permissions[i] });
      promises.push(permission._save(trx));
    }

    await Promise.all(promises);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${PermissionModel.getTableName()};`);
    await trx.query(
      sql`DROP TABLE ${PermissionModel._history.getTableName()};`
    );
  });

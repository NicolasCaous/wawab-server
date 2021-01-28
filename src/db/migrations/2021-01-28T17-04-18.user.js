"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const UserModel = rfr("src/db/models/User");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(UserModel.toSQL()[0]);
    await trx.query(UserModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${UserModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${UserModel._history.getTableName()};`);
  });

"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const PhoneModel = rfr("src/db/models/Phone");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(PhoneModel.toSQL()[0]);
    await trx.query(PhoneModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${PhoneModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${PhoneModel._history.getTableName()};`);
  });

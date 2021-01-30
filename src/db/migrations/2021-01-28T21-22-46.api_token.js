"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const ApiTokenModel = rfr("src/db/models/ApiToken");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(ApiTokenModel.toSQL()[0]);
    await trx.query(ApiTokenModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${ApiTokenModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${ApiTokenModel._history.getTableName()};`);
  });

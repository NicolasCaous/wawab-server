"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const TokenModel = rfr("src/db/models/Token");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(TokenModel.toSQL()[0]);
    await trx.query(TokenModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${TokenModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${TokenModel._history.getTableName()};`);
  });

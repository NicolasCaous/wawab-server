"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const OTPModel = rfr("src/db/models/OTP");

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(OTPModel.toSQL()[0]);
    await trx.query(OTPModel.toSQL()[1]);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    await trx.query(sql`DROP TABLE ${OTPModel.getTableName()};`);
    await trx.query(sql`DROP TABLE ${OTPModel._history.getTableName()};`);
  });

"use strict";

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

module.exports = {
  DB_CONN_STRING: `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${
    process.env.DB_HOST
  }:${process.env.DB_PORT | 5432}/${process.env.DB_NAME}`,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  DB_MAX_POOL: parseInt(process.env.DB_MAX_POOL),
  DB_MIGRATIONS_PATH: `${appRoot}/${process.env.DB_MIGRATIONS_PATH}`,
};

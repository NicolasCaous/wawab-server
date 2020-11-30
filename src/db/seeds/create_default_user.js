"use strict";
const rfr = require("rfr");

const dbConfig = rfr("src/config/db");

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

const slonik = createPool(dbConfig.DB_CONN_STRING, {
  maximumPoolSize: dbConfig.DB_MAX_POOL,
});
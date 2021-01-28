"use strict";
const rfr = require("rfr");

const dbConfig = rfr("src/config/db");

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

const { setupSlonikMigrator } = require("@slonik/migrator");
const { createPool } = require("slonik");

const slonik = createPool(dbConfig.DB_CONN_STRING, {
  maximumPoolSize: dbConfig.DB_MAX_POOL,
});

const migrator = setupSlonikMigrator({
  migrationsPath: dbConfig.DB_MIGRATIONS_PATH,
  migrationTableName: "_migrations_metadata",
  slonik,
  mainModule: module,
});

module.exports = { slonik, migrator };

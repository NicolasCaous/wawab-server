"use strict";
const rfr = require("rfr");

const dbConfig = rfr("src/config/db");
const logger = rfr("src/logger")(__filename);

const { setupSlonikMigrator } = require("@slonik/migrator");

module.exports = (slonik) =>
  setupSlonikMigrator({
    migrationsPath: dbConfig.DB_MIGRATIONS_PATH,
    slonik,
    migrationTableName: "_migrations_metadata",
    log: logger.info,
  });

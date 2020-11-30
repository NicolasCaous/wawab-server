"use strict";
const rfr = require("rfr");

const dbConfig = rfr("src/config/db");
const logger = rfr("src/logger")(__filename);

const { setupSlonikMigrator } = require("@slonik/migrator");

module.exports = (slonik) =>
  setupSlonikMigrator({
    migrationsPath: dbConfig.DB_MIGRATIONS_PATH,
    slonik,
    migrationTableName: "slonik_migration",
    log: logger.info,
  });

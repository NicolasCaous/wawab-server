"use strict";
const rfr = require("rfr");

const limitsConfig = rfr("src/config/limits");
const auth0Config = rfr("src/config/auth0");
const bootstrapConfig = rfr("src/config/bootstrap");
const dbConfig = rfr("src/config/db");
const serverConfig = rfr("src/config/server");

const errorHandler = rfr("src/error");
const logger = rfr("src/logger")(__filename);
const router = rfr("src/router");
const WhatsAppManager = rfr("src/whatsapp/manager");

const express = require("express");
const { serializeError } = require("serialize-error");
const slonik = require("slonik");
const {
  createQueryLoggingInterceptor,
} = require("slonik-interceptor-query-logging");

module.exports = async () => {
  logger.info("Bootstraping...");

  const ctx = {
    limits: {
      ...limitsConfig,
    },
    auth0: {
      ...auth0Config,
    },
  };

  ctx.whatsapp = {
    manager: new WhatsAppManager(ctx),
  };

  await setUpDatabase(ctx);

  const app = express();

  await setUpRoutes(ctx, app);

  logger.info("Bootstrap finished");
  return () => {
    logger.info("Starting server...");
    app.listen(serverConfig.PORT, () => {
      logger.info("Server started");
      logger.info(
        `Server listening at http://localhost:${serverConfig.PORT}`
      );
    });
  };
};

async function setUpDatabase(ctx) {
  if (bootstrapConfig.SETUP_DATABASE) {
    logger.debug("Setting up database...");

    try {
      ctx.db = {
        slonik: slonik.createPool(dbConfig.DB_CONN_STRING, {
          maximumPoolSize: dbConfig.DB_MAX_POOL,
          interceptors: [createQueryLoggingInterceptor()],
        }),
      };
      logger.debug("Slonik pool created");

      logger.debug("Testing database connection...");
      await ctx.db.slonik.connect(() => {});
      logger.debug("Database connection: OK");

      await runMigrations(ctx);
    } catch (error) {
      logger.error(serializeError(error), "Database Error");
      process.exit(-1);
    }

    logger.debug("Database setup finished");
  } else {
    logger.debug("Database setup skipped");
  }
}

async function runMigrations(ctx) {
  if (bootstrapConfig.RUN_MIGRATIONS) {
    logger.info("Running migrations...");

    ctx.db.migrator = rfr("src/migrator")(ctx.db.slonik);

    try {
      await ctx.db.migrator.up();
    } catch (error) {
      logger.error(serializeError(error), "Migration Error");
      process.exit(-1);
    }

    logger.info("Migrations finished");
  } else {
    logger.info("Migrations skipped");
  }
}

async function setUpRoutes(ctx, app) {
  if (bootstrapConfig.SETUP_ROUTES) {
    logger.debug("Setting up routes...");

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    try {
      await router(ctx, app);
    } catch (error) {
      logger.error(serializeError(error), "Router Error");
      process.exit(-1);
    }

    errorHandler(app);

    logger.debug("Route setup finished");
  } else {
    logger.debug("Route setup skipped");
  }
}

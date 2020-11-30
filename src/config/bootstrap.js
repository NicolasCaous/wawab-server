"use strict";

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

module.exports = {
  RUN_MIGRATIONS: process.env.BOOTSTRAP_RUN_MIGRATIONS.toLowerCase() === "true",
  SETUP_DATABASE: process.env.BOOTSTRAP_SETUP_DATABASE.toLowerCase() === "true",
  SETUP_ROUTES: process.env.BOOTSTRAP_SETUP_ROUTES.toLowerCase() === "true",
};

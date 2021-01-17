"use strict";

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

module.exports = {
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
};

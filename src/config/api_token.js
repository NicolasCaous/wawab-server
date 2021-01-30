"use strict";

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

module.exports = {
  API_TOKEN_MAX_COUNT: parseInt(process.env.API_TOKEN_MAX_COUNT),
};

"use strict";

const appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

module.exports = {
  MAX_API_TOKENS_PER_USER: parseInt(process.env.MAX_API_TOKENS_PER_USER),
  MAX_PHONES_PER_USER: parseInt(process.env.MAX_PHONES_PER_USER),
};

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
  OTP_TTL_SECONDS: parseInt(process.env.OTP_TTL_SECONDS),
  WHATSAPP_TIMEOUT_MS: parseInt(process.env.WHATSAPP_TIMEOUT_MS),
};

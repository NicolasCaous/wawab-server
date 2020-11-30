"use strict";

const appRoot = require("app-root-path");
const { default: log } = require("roarr");

module.exports = (path) => log.child({ namespace: path.replace(appRoot, "") });

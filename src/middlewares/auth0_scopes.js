"use strict";

const jwtAuthz = require("express-jwt-authz");

module.exports = (ctx, handler) => jwtAuthz(["wawab:standard"]);

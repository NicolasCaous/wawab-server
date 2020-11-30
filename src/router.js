"use strict";
const rfr = require("rfr");

const root = "src/routes";

module.exports = async (ctx, app) => {
  app.get("/", rfr(`${root}`).GET);
  app.get("/", rfr(`${root}/`).GET);
};

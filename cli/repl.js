const rfr = require("rfr/lib/rfr");

global.rfr = require("rfr");
global.dbConfig = rfr("src/config/db");
global.appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

global.slonik = require("slonik");
global.pool = slonik.createPool(dbConfig.DB_CONN_STRING, {
  maximumPoolSize: dbConfig.DB_MAX_POOL,
});

global.fs = require("fs");

fs.readdirSync(`${appRoot}/src/db/models`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`src/db/models/${file}`);
    global[cls.name] = cls;
  }
});

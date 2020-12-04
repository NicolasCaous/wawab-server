const rfr = require("rfr/lib/rfr");

global.rfr = require("rfr");
global.dbConfig = rfr("src/config/db");
global.appRoot = require("app-root-path");

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

global.uuid = require("uuid");
global.slonik = require("slonik");
global.sql = slonik.sql;
global.pool = slonik.createPool(dbConfig.DB_CONN_STRING, {
  maximumPoolSize: dbConfig.DB_MAX_POOL,
});
global.startTransaction = rfr("src/utils/slonik/transaction").startTransaction;
global.SERIALIZABLE = rfr("src/utils/slonik/transaction").SERIALIZABLE;
global.REPEATABLE_READ = rfr("src/utils/slonik/transaction").REPEATABLE_READ;
global.READ_COMMITTED = rfr("src/utils/slonik/transaction").READ_COMMITTED;
global.READ_UNCOMMITTED = rfr("src/utils/slonik/transaction").READ_UNCOMMITTED;

global.fs = require("fs");

fs.readdirSync(`${appRoot}/src/db/models`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`src/db/models/${file}`);
    global[cls.name] = cls;
  }
});

fs.readdirSync(`${appRoot}/src/utils/slorm/constraints`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`/src/utils/slorm/constraints/${file}`);
    global[cls.name] = cls;
  }
});

fs.readdirSync(`${appRoot}/src/utils/slorm/fields`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`/src/utils/slorm/fields/${file}`);
    global[cls.name] = cls;
  }
});

fs.readdirSync(`${appRoot}/src/utils/slorm`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`/src/utils/slorm/${file}`);
    global[cls.name] = cls;
  }
});

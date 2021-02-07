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
global.startTransaction = require("@slorm/slorm").transaction.startTransaction;
global.SERIALIZABLE = require("@slorm/slorm").transaction.SERIALIZABLE;
global.REPEATABLE_READ = require("@slorm/slorm").transaction.REPEATABLE_READ;
global.READ_COMMITTED = require("@slorm/slorm").transaction.READ_COMMITTED;
global.READ_UNCOMMITTED = require("@slorm/slorm").transaction.READ_UNCOMMITTED;

global.fs = require("fs");

fs.readdirSync(`${appRoot}/src/db/models`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`src/db/models/${file}`);
    global[cls.name] = cls;
  }
});

global.SlormConstraint = require("@slorm/slorm").SlormConstraint;
global.SlormField = require("@slorm/slorm").SlormField;

for (let attr in require("@slorm/slorm")) {
  let exported = require("@slorm/slorm")[attr];

  if (
    exported.prototype instanceof global.SlormConstraint ||
    exported.prototype instanceof global.SlormField
  )
    global[attr] = require("@slorm/slorm")[attr];
}

global.escape = require("@slorm/slorm").escape;
global.joinSQLTemplates = require("@slorm/slorm").joinSQLTemplates;
global.transaction = require("@slorm/slorm").transaction;

fs.readdirSync(`${appRoot}/src/whatsapp`).forEach((file) => {
  if (file.endsWith(".js")) {
    let cls = rfr(`src/whatsapp/${file}`);
    global[cls.name] = cls;
  }
});

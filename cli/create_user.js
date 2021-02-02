"use strict";
const rfr = require("rfr");

const dbConfig = rfr("src/config/db");

const UserModel = rfr("src/db/models/User");
const UserRoleModel = rfr("src/db/models/UserRole");
const RoleModel = rfr("src/db/models/Role");

const { transaction } = require("@slorm/slorm");
const appRoot = require("app-root-path");
const axios = require("axios");
const fetch = require("node-fetch");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

require("dotenv").config({
  path: process.env.NODE_ENV
    ? `${appRoot}/.env.${process.env.NODE_ENV}`
    : `${appRoot}/.env`,
});

const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

const { createPool, sql } = require("slonik");

const pool = createPool(dbConfig.DB_CONN_STRING, {
  maximumPoolSize: dbConfig.DB_MAX_POOL,
});

const startPasswordless = async (email) => {
  return await fetch(`${AUTH0_DOMAIN}/passwordless/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: AUTH0_CLIENT_ID,
      connection: "email",
      email: email,
      send: "code",
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error === "bad.email") {
        return {
          status: "BAD_EMAIL",
          error: res.error,
        };
      }
      if (res.error) {
        return {
          status: "ERROR",
          error: res.error,
        };
      }
      return { status: "OK", data: res };
    })
    .catch((err) => {
      return { status: "ERROR", error: err };
    });
};

const finishPasswordless = async (email, code) => {
  return await fetch(`${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
      client_id: AUTH0_CLIENT_ID,
      username: email,
      otp: code,
      realm: "email",
      audience: AUTH0_AUDIENCE,
      scope: "openid profile email wawab:standard",
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error === "access_denied") {
        return {
          status: "ACCESS_DENIED",
          error: res.error,
        };
      }
      if (res.error === "invalid_grant") {
        return {
          status: "INVALID_GRANT",
          error: res.error,
        };
      }
      if (res.error) {
        return {
          status: "ERROR",
          error: res.error,
        };
      }
      return { status: "OK", data: res };
    })
    .catch((err) => {
      return { status: "ERROR", error: err };
    });
};

rl.question("Qual tipo? (admin|standard): ", async (role_label) => {
  role_label = role_label.toLowerCase();
  if (!["admin", "standard"].includes(role_label)) {
    console.log(`Tipo "${role_label}" inválido`);
    process.exit(-1);
  }
  console.log(role_label);

  rl.question("E-mail do usuário: ", async (email) => {
    let result = await startPasswordless(email);
    console.log(result);

    if (result.status !== "OK") process.exit(-1);
    else
      rl.question("Código: ", async (code) => {
        let result = await finishPasswordless(email, code);
        console.log(result);

        if (result.status !== "OK") process.exit(-1);

        result = await axios({
          url: `${AUTH0_DOMAIN}/userinfo`,
          method: "GET",
          headers: { Authorization: `Bearer ${result.data.access_token}` },
        }).catch((err) => err.response);

        if (result.status !== 200) process.exit(-1);
        console.log(result.data);

        try {
          await transaction.startTransaction(pool, async (trx) => {
            let user = new UserModel({
              email: result.data.email,
              gravatar_picture:
                result.data.picture !== undefined ? result.data.picture : null,
              auth0_id: result.data.sub.split("|")[1],
            });

            let role_id = (
              await trx.query(
                sql`SELECT id FROM ${RoleModel.getTableName()}
                    WHERE label = ${role_label}`
              )
            ).rows[0].id;

            await user._save(trx);

            let user_role = new UserRoleModel({ user: user.id, role: role_id });
            await user_role._save(trx);

            console.log(user);
          });
          process.exit(0);
        } catch (err) {
          console.err(err);
          process.exit(1);
        }
      });
  });
});

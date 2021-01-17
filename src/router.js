"use strict";
const rfr = require("rfr");

const auth0Middleware = rfr("src/middlewares/auth0");
const auth0ScopesMiddleware = rfr("src/middlewares/auth0Scopes");
const fastValidateMiddleware = rfr("src/middlewares/fast_validate");
const validateMiddleware = rfr("src/middlewares/validate");

const root = "src/routes";

module.exports = async (ctx, app) => {
  const middlewares = [
    auth0Middleware,
    auth0ScopesMiddleware,
    fastValidateMiddleware,
    validateMiddleware,
  ];

  const setupRoute = (middlewares, route) => {
    return [middlewares.map((m) => m(ctx, route(ctx))), route(ctx)];
  };

  app.get("/", ...setupRoute(middlewares, rfr(`${root}/get`)));
};

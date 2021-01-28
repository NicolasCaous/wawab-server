"use strict";
const rfr = require("rfr");

const apiTokenMiddleware = rfr("src/middlewares/api_token");
const auth0Middleware = rfr("src/middlewares/auth0");
const auth0ScopesMiddleware = rfr("src/middlewares/auth0_scopes");
const createUserMiddleware = rfr("src/middlewares/create_user");
const fastValidateMiddleware = rfr("src/middlewares/fast_validate");
const routePermission = rfr("src/middlewares/route_permission");
const validateMiddleware = rfr("src/middlewares/validate");

const root = "src/routes";

module.exports = async (ctx, app) => {
  const standardMiddlewares = [
    auth0Middleware,
    auth0ScopesMiddleware,
    createUserMiddleware,
    routePermission,
    fastValidateMiddleware,
    validateMiddleware,
  ];

  const tokenMiddlewares = [
    apiTokenMiddleware,
    routePermission,
    fastValidateMiddleware,
    validateMiddleware,
  ];

  const setupRoute = (mid, route) => {
    return [mid.map((m) => m(ctx, route(ctx))), route(ctx)];
  };

  // prettier-ignore
  app.get("/", rfr(`${root}/get`)(ctx));
  // prettier-ignore
  app.post("/otp/send", ...setupRoute(tokenMiddlewares, rfr(`${root}/otp/send/post`)));
  // prettier-ignore
  app.post("/otp/verify", ...setupRoute(tokenMiddlewares, rfr(`${root}/otp/verify/post`)));
  // prettier-ignore
  app.delete("/user/token/:token", ...setupRoute(standardMiddlewares, rfr(`${root}/user/token/_token/delete`)));
  // prettier-ignore
  app.get("/user/token", ...setupRoute(standardMiddlewares, rfr(`${root}/user/token/get`)));
  // prettier-ignore
  app.post("/user/token", ...setupRoute(standardMiddlewares, rfr(`${root}/user/token/post`)));
};

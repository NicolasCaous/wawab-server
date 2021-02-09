"use strict";
const rfr = require("rfr");

const apiTokenMiddleware = rfr("src/middlewares/api_token");
const auth0Middleware = rfr("src/middlewares/auth0");
const auth0ScopesMiddleware = rfr("src/middlewares/auth0_scopes");
const createUserMiddleware = rfr("src/middlewares/create_user");
const fastValidateMiddleware = rfr("src/middlewares/fast_validate");
const routePermission = rfr("src/middlewares/route_permission");
const validateAndExecuteMiddleware = rfr(
  "src/middlewares/validate_and_execute"
);

const root = "src/routes";

module.exports = async (ctx, app) => {
  const standardMiddlewares = [
    auth0Middleware,
    auth0ScopesMiddleware,
    createUserMiddleware,
    routePermission,
    fastValidateMiddleware,
    validateAndExecuteMiddleware,
  ];

  const tokenMiddlewares = [
    apiTokenMiddleware,
    routePermission,
    fastValidateMiddleware,
    validateAndExecuteMiddleware,
  ];

  const setupRoute = (mid, route) => {
    route = route(ctx);
    return mid.map((m) => m(ctx, route));
  };

  // prettier-ignore
  app.get("/", rfr(`${root}/get`)(ctx));
  // prettier-ignore
  app.post("/otp/send", setupRoute(tokenMiddlewares, rfr(`${root}/otp/send/post`)));
  // prettier-ignore
  app.post("/otp/verify", setupRoute(tokenMiddlewares, rfr(`${root}/otp/verify/post`)));
  // prettier-ignore
  app.get("/user/phone", setupRoute(standardMiddlewares, rfr(`${root}/user/phone/get`)));
  // prettier-ignore
  app.post("/user/phone", setupRoute(standardMiddlewares, rfr(`${root}/user/phone/post`)));
  // prettier-ignore
  app.put("/user/phone", setupRoute(standardMiddlewares, rfr(`${root}/user/phone/put`)));
  // prettier-ignore
  app.delete("/user/token/:id", setupRoute(standardMiddlewares, rfr(`${root}/user/token/$id/delete`)));
  // prettier-ignore
  app.get("/user/token", setupRoute(standardMiddlewares, rfr(`${root}/user/token/get`)));
  // prettier-ignore
  app.post("/user/token", setupRoute(standardMiddlewares, rfr(`${root}/user/token/post`)));
};

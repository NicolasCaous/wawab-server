"use strict";

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

module.exports = (ctx, handler) =>
  // Authorization middleware. When used, the
  // Access Token must exist and be verified against
  // the Auth0 JSON Web Key Set
  jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${ctx.auth0.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    audience: ctx.auth0.AUTH0_AUDIENCE,
    issuer: `${ctx.auth0.AUTH0_DOMAIN}/`,
    algorithms: ["RS256"],
  });

"use strict";

const axios = require("axios");

module.exports = (ctx, handler) => async (req, res, next) => {
  const access_token = req.headers.authorization.split(" ")[1];

  let result = await axios({
    url: `${ctx.auth0.AUTH0_DOMAIN}/userinfo`,
    method: "GET",
    headers: { Authorization: `Bearer ${access_token}` },
  }).catch((err) => err.response);

  if (result.status === 200) {
    req.auth0data = result.data;
    await next();
  } else {
    res.status(result.status).json(result.data);
  }
};

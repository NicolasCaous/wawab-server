"use strict";
const rfr = require("rfr");

const bootstrap = rfr("src/bootstrap");

const main = async () => {
  const server = await bootstrap();

  server();
};

main();

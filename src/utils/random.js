"use strict";

const crypto = require("crypto");

module.exports = (size, format) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(size, function (err, buffer) {
      if (err) reject(err);
      resolve(buffer.toString(format));
    });
  });

"use strict";
const rfr = require("rfr");

const logger = rfr("src/logger")(__filename);

const baileys = require("@adiwajshing/baileys");
const { serializeError } = require("serialize-error");
const { transaction } = require("@slorm/slorm");

class WhatsAppConnection {
  #ctx;
  conn;

  constructor(ctx, sender) {
    this.#ctx = ctx;
    this.sender = sender;

    if (sender.expired) throw new Error("Sender expired");
  }

  async connect() {
    try {
      this.conn = new baileys.WAConnection();
      this.conn.autoReconnect = baileys.ReconnectMode.onAllErrors;

      this.conn.loadAuthInfo({
        clientID: this.sender.auth_client_id,
        serverToken: this.sender.auth_server_token,
        clientToken: this.sender.auth_client_token,
        encKey: this.sender.auth_enc_key,
        macKey: this.sender.auth_mac_key,
      });
    } catch (err) {
      logger.error(serializeError(err), "Whatsapp Error");
      delete this.conn;

      await transaction.startTransaction(this.#ctx.db.slonik, async (trx) => {
        this.sender.expired = true;
        await this.sender._save(trx);
      });

      return { status: "CONN_ERROR_INVALID_CRED", err };
    }

    this.conn.on("credentials-updated", async () => {
      let cred = this.conn.base64EncodedAuthInfo();

      await transaction.startTransaction(this.#ctx.db.slonik, async (trx) => {
        this.sender.auth_client_id = cred.clientID;
        this.sender.auth_server_token = cred.serverToken;
        this.sender.auth_client_token = cred.clientToken;
        this.sender.auth_enc_key = cred.encKey;
        this.sender.auth_mac_key = cred.macKey;

        await this.sender._save(trx);
      });
    });

    this.conn.on("open", (result) => {
      //console.log(result);
    });

    try {
      let result = await Promise.race([
        new Promise(async (resolve) => {
          try {
            await this.conn.connect();
          } catch (err) {
            resolve({ status: "ERROR", err });
          }
          resolve({ status: "OK" });
        }),
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({ status: "CONNECT_TIMEOUT" });
          }, this.#ctx.limits.WHATSAPP_TIMEOUT_MS)
        ),
      ]);

      if (result !== "OK") return result;
    } catch (err) {
      logger.error(serializeError(err), "Whatsapp Error");

      await transaction.startTransaction(this.#ctx.db.slonik, async (trx) => {
        this.sender.expired = true;
        await this.sender._save(trx);
      });

      return { status: "CONN_ERROR_CONNECT_FAILED", err };
    }
  }

  async sendMessage(target, message) {
    try {
      let result = await Promise.race([
        new Promise(async (resolve) => {
          try {
            resolve({
              status: "OK",
              value: await this.conn.isOnWhatsApp(target.split("@")[0]),
            });
          } catch (err) {
            resolve({ status: "ERROR", err });
          }
        }),
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({ status: "VERIFY_IF_TARGET_IS_ON_WHATSAPP_TIMEOUT" });
          }, this.#ctx.limits.WHATSAPP_TIMEOUT_MS)
        ),
      ]);

      if (result.status !== "OK") return result;

      result = result.value;

      if (result === undefined || !result.exists) {
        return { status: "TARGET_NOT_ON_WHATSAPP" };
      }
    } catch (err) {
      logger.error(serializeError(err), "Whatsapp Error");
      return { status: "CONN_FAILED_TO_VERIFY_IF_TARGET_IS_ON_WHATSAPP", err };
    }

    let sendMessageResponse;
    try {
      let result = await Promise.race([
        new Promise(async (resolve) => {
          try {
            sendMessageResponse = await this.conn.sendMessage(
              target,
              message,
              baileys.MessageType.text
            );
          } catch (err) {
            resolve({ status: "ERROR", err });
          }
          resolve({ status: "OK" });
        }),
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({ status: "SEND_MESSAGE_TIMEOUT" });
          }, this.#ctx.limits.WHATSAPP_TIMEOUT_MS)
        ),
      ]);

      if (result !== "OK") return result;
    } catch (err) {
      logger.error(serializeError(err), "Whatsapp Error");
      return { status: "CONN_FAILED_TO_DELIVER", err };
    }

    return { status: "OK" };
  }

  async close() {
    try {
      if (this.conn != undefined) this.conn.close();
    } catch (err) {
      logger.error(serializeError(err), "Whatsapp Error");
    }
  }
}

module.exports = WhatsAppConnection;

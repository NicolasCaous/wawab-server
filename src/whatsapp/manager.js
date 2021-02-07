"use strict";
const rfr = require("rfr");

const logger = rfr("src/logger")(__filename);

const OTPModel = rfr("src/db/models/OTP");
const WhatsAppConnection = rfr("src/whatsapp/connection");

const baileys = require("@adiwajshing/baileys");
const { serializeError } = require("serialize-error");
const { transaction } = require("@slorm/slorm");

class WhatsAppManager {
  #ctx;

  active = {};

  constructor(ctx) {
    this.#ctx = ctx;
  }

  async sendOTP(trx, sender, receiver, message, author) {
    let code = "";

    for (let i = 0; i < 6; ++i)
      code += Math.floor(Math.random() * 10).toString();

    let otp = new OTPModel({
      code: code,
      message: message,
      receiver: receiver,
      sender: sender.id,
      status: "QUEUED",
    });
    await otp._save(trx, author);

    let conn;
    let isNew = false;

    if (!(sender.jid in this.active)) {
      isNew = true;

      try {
        this.active[sender.jid] = new WhatsAppConnection(this.#ctx, sender);
      } catch (err) {
        logger.error(serializeError(err), "Whatsapp Error");

        otp.status = "SENDER_EXPIRED";
        await otp._save(trx, author);
        await otp._delete(trx, author);

        return { status: "SENDER_EXPIRED" };
      }

      let result = await this.active[sender.jid].connect();

      if (result.status !== "OK") {
        otp.status = result.status;
        await otp._save(trx, author);
        await otp._delete(trx, author);

        if (isNew) {
          await this.active[sender.jid].close();
          delete this.active[sender.jid];
        }

        return await result;
      }
    }

    conn = this.active[sender.jid];

    let result = await conn.sendMessage(
      receiver,
      message.replace("${code}", code)
    );
    if (result.status !== "OK") {
      otp.status = result.status;
      await otp._save(trx, author);
      await otp._delete(trx, author);

      if (isNew) {
        await conn.close();
        delete this.active[sender.jid];
      }

      return result;
    }

    if (isNew) {
      await conn.close();
      delete this.active[sender.jid];
    }

    otp.status = "WAITING_VERIFICATION";
    await otp._save(trx, author);

    return { status: "OK" };
  }

  testCredential(cred, dryrun) {
    return Promise.race([
      new Promise((resolve) =>
        setTimeout(() => {
          resolve({ status: "TIMEOUT" });
        }, this.#ctx.limits.WHATSAPP_TIMEOUT_MS)
      ),
      new Promise(async (resolve) => {
        const conn = new baileys.WAConnection();

        try {
          conn.loadAuthInfo(cred);
        } catch (err) {
          logger.error(serializeError(err), "Whatsapp Error");
          resolve({ status: "INVALID_CRED", err });
          return;
        }

        let new_cred;

        conn.on("credentials-updated", () => {
          new_cred = conn.base64EncodedAuthInfo();
        });
        conn.on("open", (result) => {
          resolve({ status: "OK", result, ...(new_cred ? { new_cred } : {}) });
        });

        if (dryrun === true) {
          resolve({ status: "OK" });
          return;
        }

        try {
          await conn.connect();
        } catch (err) {
          logger.error(serializeError(err), "Whatsapp Error");
          resolve({ status: "ERROR", err });
          return;
        }

        conn.close();
      }),
    ]);
  }

  async verifyOTP(trx, sender, receiver, code, author) {
    let otps = await OTPModel.listBySenderAndReceiver(trx, sender.id, receiver);

    for (let i in otps) {
      let otp = otps[i];

      if (
        otp.created_at.getTime() + this.#ctx.limits.OTP_TTL_SECONDS * 1000 <
        new Date().getTime()
      ) {
        otp.status = "EXPIRED";
        await otp._save(trx, author);
        await otp._delete(trx, author);
      }
    }

    for (let i in otps) {
      let otp = otps[i];

      if (otp.status !== "WAITING_VERIFICATION") continue;

      if (otp.code === code) {
        otp.status = "VERIFIED";
        await otp._save(trx, author);
        await otp._delete(trx, author);

        for (let j in otps) {
          if (otps[j].id !== otp.id) {
            let other_otp = otps[j];

            if (other_otp.status !== "WAITING_VERIFICATION") continue;

            other_otp.status = "NOT_USED";
            await other_otp._save(trx, author);
            await other_otp._delete(trx, author);
          }
        }

        return true;
      }
    }

    return false;
  }
}

module.exports = WhatsAppManager;

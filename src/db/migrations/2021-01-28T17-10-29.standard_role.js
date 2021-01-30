"use strict";
const rfr = require("rfr");

const { transaction } = require("@slorm/slorm");

const PermissionModel = rfr("src/db/models/Permission");
const RolePermissionModel = rfr("src/db/models/RolePermission");
const RoleModel = rfr("src/db/models/Role");

const paths = [
  "POST:/otp/send",
  "POST:/otp/verify",
  "DELETE:/user/token/:id",
  "GET:/user/token",
  "POST:/user/token",
];

exports.up = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    let role = new RoleModel({ label: "standard" });

    await role._save(trx);

    let permissions = await trx.query(
      sql`SELECT id FROM ${PermissionModel.getTableName()}
          WHERE path = ANY(${sql.array(paths, "varchar")})`
    );

    permissions = permissions.rows.map((x) => x.id);

    let promises = [];
    for (let i in permissions) {
      promises.push(
        new RolePermissionModel({
          role: role.id,
          permission: permissions[i],
        })._save(trx)
      );
    }

    await Promise.all(promises);
  });

exports.down = async ({ slonik, sql }) =>
  await transaction.startTransaction(slonik, async (trx) => {
    let result = await trx.query(sql`SELECT id FROM ${RoleModel.getTableName()} 
                                     WHERE label = 'standard'`);

    let role_id = result.rows[0].id;

    await trx.query(
      sql`DELETE FROM ${RolePermissionModel.getTableName()}
          WHERE role = ${role_id}`
    );
    await trx.query(
      sql`DELETE FROM ${RolePermissionModel._history.getTableName()}
          WHERE role = ${role_id}`
    );

    await trx.query(
      sql`DELETE FROM ${RoleModel.getTableName()}
          WHERE id = ${role_id}`
    );
    await trx.query(
      sql`DELETE FROM ${RoleModel._history.getTableName()}
          WHERE id = ${role_id}`
    );
  });

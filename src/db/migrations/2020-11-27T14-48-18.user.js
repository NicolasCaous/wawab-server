exports.up = async ({ slonik, sql }) => await slonik.query(sql`select true`);
exports.down = async ({ slonik, sql }) => await slonik.query(sql`select true`);

import { pool } from "../../db/index.js";
const issuesPostDB = async (payLoad) => {
    const { title, description, type, reporter_id } = payLoad;
    const result = await pool.query(`
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES($1,$2,$3,$4)
      RETURNING *
    `, [title, description, type, reporter_id]);
    return result;
};
const issuesGetDB = async (filters) => {
    const clauses = [];
    const values = [];
    if (filters?.type) {
        clauses.push(`type = $${values.length + 1}`);
        values.push(filters.type);
    }
    if (filters?.status) {
        clauses.push(`status = $${values.length + 1}`);
        values.push(filters.status);
    }
    const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const order = filters?.sort === "oldest" ? "ASC" : "DESC";
    const result = await pool.query(`
      SELECT * FROM issues
      ${whereClause}
      ORDER BY created_at ${order}
    `, values);
    return result;
};
const issuesParamsDB = async (id) => {
    const result = await pool.query(`
      SELECT * FROM issues WHERE id=$1
    `, [id]);
    return result;
};
const getReportersByIds = async (ids) => {
    if (ids.length === 0) {
        return [];
    }
    const result = await pool.query(`
      SELECT id, name, role FROM users WHERE id = ANY($1)
    `, [ids]);
    return result.rows;
};
const issuesUpdateDB = async (payLoad, id) => {
    const { title, description, type, status, reporter_id } = payLoad;
    const result = await pool.query(`
      UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        reporter_id = COALESCE($5, reporter_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
        title ?? null,
        description ?? null,
        type ?? null,
        status ?? null,
        reporter_id ?? null,
        id,
    ]);
    return result;
};
const issuesDelete = async (id) => {
    const result = await pool.query(`
      DELETE FROM issues WHERE id=$1 RETURNING *
    `, [id]);
    return result;
};
export const issuesService = {
    issuesPostDB,
    issuesGetDB,
    issuesParamsDB,
    getReportersByIds,
    issuesUpdateDB,
    issuesDelete,
};
//# sourceMappingURL=issues.service.js.map
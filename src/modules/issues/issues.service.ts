import { pool } from "../../db/index.js";
import type { typeIssue } from "./issues.interface.js";

const issuesPostDB = async (payLoad: typeIssue) => {
  const { title, description, type, reporter_id } = payLoad;
  const result = await pool.query(
    `
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES($1,$2,$3,$4)
      RETURNING *
    `,
    [title, description, type, reporter_id],
  );
  return result;
};

const issuesGetDB = async () => {
  const result = await pool.query(
    `
      SELECT * FROM issues
    `,
  );
  return result;
};

const issuesParamsDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );
  return result;
};

const issuesUpdateDB = async (payLoad: Partial<typeIssue>, id: string) => {
  const { title, description, type, status, reporter_id } = payLoad;

  const result = await pool.query(
    `
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
    `,
    [
      title ?? null,
      description ?? null,
      type ?? null,
      status ?? null,
      reporter_id ?? null,
      id,
    ],
  );
  return result;
};

const issuesDelete = async (id: string) => {
  const result = await pool.query(
    `
      DELETE FROM issues WHERE id=$1 RETURNING *
    `,
    [id],
  );
  return result;
};

export const issuesService = {
  issuesPostDB,
  issuesGetDB,
  issuesParamsDB,
  issuesUpdateDB,
  issuesDelete,
};

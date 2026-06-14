import { pool } from "../../db/index.js";
import { addWhereCondition } from "../../utils/sql.js";
import type {
  CreateIssuePayload,
  GetIssuesQuery,
  IssueEntity,
  IssueReporter,
  IssueWithReporter,
  UpdateIssuePayload,
} from "./issues.interface.js";

const issuesPostDB = async (
  payload: CreateIssuePayload,
  userId: number,
): Promise<IssueEntity> => {
  const { title, description, type } = payload;
  const result = await pool.query<IssueEntity>(
    `
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES($1,$2,$3,$4)
      RETURNING *
    `,
    [title, description, type, userId],
  );
  return result.rows[0] as IssueEntity;
};

const getIssuesDB = async (params: GetIssuesQuery): Promise<IssueWithReporter[]> => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.type) {
    addWhereCondition(conditions, values, "type", params.type);
  }

  if (params.status) {
    addWhereCondition(conditions, values, "status", params.status);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderSql = params.sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query<IssueEntity>(
    `
      SELECT *
      FROM issues
      ${whereSql}
      ORDER BY created_at ${orderSql}
    `,
    values,
  );

  const issues = issuesResult.rows;
  const reporterIds = Array.from(new Set(issues.map((i) => i.reporter_id)));
  if (reporterIds.length === 0) {
    return issues.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      type: i.type,
      status: i.status,
      reporter: null,
      created_at: i.created_at,
      updated_at: i.updated_at,
    }));
  }

  const reportersResult = await pool.query<IssueReporter>(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
    `,
    [reporterIds],
  );

  const reporterById = new Map<number, IssueReporter>();
  for (const r of reportersResult.rows) reporterById.set(r.id, r);

  return issues.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    type: i.type,
    status: i.status,
    reporter: reporterById.get(i.reporter_id) ?? null,
    created_at: i.created_at,
    updated_at: i.updated_at,
  }));
};

const getIssueByIdDB = async (id: number): Promise<IssueWithReporter | null> => {
  const issueResult = await pool.query<IssueEntity>(
    `
      SELECT *
      FROM issues
      WHERE id=$1
      LIMIT 1
    `,
    [id],
  );

  const issue = issueResult.rows[0];
  if (!issue) return null;

  const reporterResult = await pool.query<IssueReporter>(
    `
      SELECT id, name, role
      FROM users
      WHERE id=$1
      LIMIT 1
    `,
    [issue.reporter_id],
  );

  const reporter = reporterResult.rows[0] ?? null;

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const getRawIssueByIdDB = async (id: number): Promise<IssueEntity | null> => {
  const issueResult = await pool.query<IssueEntity>(
    `
      SELECT *
      FROM issues
      WHERE id=$1
      LIMIT 1
    `,
    [id],
  );

  return issueResult.rows[0] ?? null;
};

const updateIssueDB = async (
  id: number,
  payload: UpdateIssuePayload,
): Promise<IssueEntity | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.type !== undefined) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }

  if (fields.length === 0) return null;

  const setSql = `${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP`;
  values.push(id);

  const result = await pool.query<IssueEntity>(
    `
      UPDATE issues
      SET ${setSql}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values,
  );

  return result.rows[0] ?? null;
};

const deleteIssueDB = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id=$1
    `,
    [id],
  );
  return (result.rowCount ?? 0) > 0;
};


export const issuesService = {
  issuesPostDB,
  getIssuesDB,
  getIssueByIdDB,
  getRawIssueByIdDB,
  updateIssueDB,
  deleteIssueDB,
};

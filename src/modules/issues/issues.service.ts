import { pool } from "../../db/index.js";
import type { typeIssue } from "./issues.interface.js";

type IssueStatus = "open" | "in_progress" | "resolved";
type IssueType = "bug" | "feature_request";

export type IssueRow = {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
};

type ReporterPublic = { id: number; name: string; role: string };

export type IssueWithReporter = Omit<IssueRow, "reporter_id"> & {
  reporter: ReporterPublic | null;
};

const issuesPostDB = async (
  payLoad: Pick<typeIssue, "title" | "description" | "type">,
  userId: number,
): Promise<IssueRow> => {
  const { title, description, type } = payLoad;
  const result = await pool.query<IssueRow>(
    `
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES($1,$2,$3,$4)
      RETURNING *
    `,
    [title, description, type, userId],
  );
  return result.rows[0] as IssueRow;
};

const getIssuesDB = async (params: {
  sort: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}): Promise<IssueWithReporter[]> => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.type) {
    values.push(params.type);
    conditions.push(`type = $${values.length}`);
  }

  if (params.status) {
    values.push(params.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderSql = params.sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query<IssueRow>(
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

  const reportersResult = await pool.query<ReporterPublic>(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
    `,
    [reporterIds],
  );

  const reporterById = new Map<number, ReporterPublic>();
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
  const issueResult = await pool.query<IssueRow>(
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

  const reporterResult = await pool.query<ReporterPublic>(
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

const getRawIssueByIdDB = async (id: number): Promise<IssueRow | null> => {
  const issueResult = await pool.query<IssueRow>(
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
  payLoad: Partial<Pick<typeIssue, "title" | "description" | "type">>,
): Promise<IssueRow | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (payLoad.title !== undefined) {
    values.push(payLoad.title);
    fields.push(`title = $${values.length}`);
  }

  if (payLoad.description !== undefined) {
    values.push(payLoad.description);
    fields.push(`description = $${values.length}`);
  }

  if (payLoad.type !== undefined) {
    values.push(payLoad.type);
    fields.push(`type = $${values.length}`);
  }

  if (fields.length === 0) return null;

  const setSql = `${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP`;
  values.push(id);

  const result = await pool.query<IssueRow>(
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

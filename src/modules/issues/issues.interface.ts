import type { UserRole } from "../../type/index.js";

export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
}

export interface IssueEntity {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface IssueReporter {
  id: number;
  name: string;
  role: UserRole;
}


export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: IssueReporter | null;
  created_at: string;
  updated_at: string;
}

export interface GetIssuesQuery {
  sort: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}

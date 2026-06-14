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
type ReporterPublic = {
    id: number;
    name: string;
    role: string;
};
export type IssueWithReporter = Omit<IssueRow, "reporter_id"> & {
    reporter: ReporterPublic | null;
};
export declare const issuesService: {
    issuesPostDB: (payLoad: Pick<typeIssue, "title" | "description" | "type">, userId: number) => Promise<IssueRow>;
    getIssuesDB: (params: {
        sort: "newest" | "oldest";
        type?: IssueType;
        status?: IssueStatus;
    }) => Promise<IssueWithReporter[]>;
    getIssueByIdDB: (id: number) => Promise<IssueWithReporter | null>;
    getRawIssueByIdDB: (id: number) => Promise<IssueRow | null>;
    updateIssueDB: (id: number, payLoad: Partial<Pick<typeIssue, "title" | "description" | "type">>) => Promise<IssueRow | null>;
    deleteIssueDB: (id: number) => Promise<boolean>;
};
export {};
//# sourceMappingURL=issues.service.d.ts.map
import type { typeIssue } from "./issues.interface.js";
export declare const issuesService: {
    issuesPostDB: (payLoad: typeIssue) => Promise<import("pg").QueryResult<any>>;
    issuesGetDB: (filters?: {
        sort?: "newest" | "oldest";
        type?: "bug" | "feature_request";
        status?: "open" | "in_progress" | "resolved";
    }) => Promise<import("pg").QueryResult<any>>;
    issuesParamsDB: (id: string) => Promise<import("pg").QueryResult<any>>;
    getReportersByIds: (ids: number[]) => Promise<any[]>;
    issuesUpdateDB: (payLoad: Partial<typeIssue>, id: string) => Promise<import("pg").QueryResult<any>>;
    issuesDelete: (id: string) => Promise<import("pg").QueryResult<any>>;
};
//# sourceMappingURL=issues.service.d.ts.map
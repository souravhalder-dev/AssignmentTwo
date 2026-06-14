import type { Request, Response } from "express";
import type { AuthRequest } from "../../middlewares/middlewares.js";
export declare const issuesController: {
    issuesCreate: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAllIssues: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getSingleIssue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateIssue: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteIssue: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=issues.controller.d.ts.map
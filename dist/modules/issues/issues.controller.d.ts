import type { Request, Response } from "express";
export declare const issuesController: {
    issuesCreate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    issuesGet: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    issuesParams: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    issuesUpdate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    issuesDelete: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=issues.controller.d.ts.map
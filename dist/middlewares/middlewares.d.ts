import type { NextFunction, Request, Response } from "express";
declare const auth: () => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default auth;
//# sourceMappingURL=middlewares.d.ts.map
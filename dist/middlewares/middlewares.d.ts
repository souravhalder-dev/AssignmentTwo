import type { NextFunction, Request, Response } from "express";
import type { IUserMiddleware, ROLES } from "../type/index.js";
export interface AuthRequest extends Request {
    user?: IUserMiddleware;
}
declare const auth: (...role: ROLES[]) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default auth;
//# sourceMappingURL=middlewares.d.ts.map
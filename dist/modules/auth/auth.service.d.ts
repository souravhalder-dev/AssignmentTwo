import type { Iuser } from "./auth.interface.js";
export declare const authService: {
    regUser: (payLoad: Iuser) => Promise<import("pg").QueryResult<any>>;
    loginUser: (payload: {
        email: string;
        password: string;
    }) => Promise<{
        token: string;
        user: any;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map
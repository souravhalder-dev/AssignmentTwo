export declare const USER_ROLE: {
    readonly contributor: "contributor";
    readonly maintainer: "maintainer";
};
export type ROLES = "contributor" | "maintainer";
export interface IUserMiddleware {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=index.d.ts.map
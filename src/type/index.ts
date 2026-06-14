export const USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer",
} as const;

export type ROLES = "contributor" | "maintainer";

export interface IUserMiddleware {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

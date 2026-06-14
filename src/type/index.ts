export const USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

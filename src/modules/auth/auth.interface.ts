import type { UserRole } from "../../type/index.js";

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<UserEntity, "password">;

export interface LoginResponsePayload {
  token: string;
  user: SafeUser;
}

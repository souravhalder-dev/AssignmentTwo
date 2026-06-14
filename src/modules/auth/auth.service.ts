import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../db/index.js";
import config from "../../config/index.js";
import { AppError } from "../../utils/appError.js";
import type {
  LoginResponsePayload,
  LoginUserPayload,
  RegisterUserPayload,
  SafeUser,
  UserEntity,
} from "./auth.interface.js";

const registerUser = async (
  payload: RegisterUserPayload,
): Promise<SafeUser> => {
  const { name, email, password, role } = payload;
  const existingUserResult = await pool.query<{ id: number }>(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  if (existingUserResult.rows[0]) {
    throw new AppError(
      "Bad Request",
      StatusCodes.BAD_REQUEST,
      "Email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query<UserEntity>(
    `
      INSERT INTO users(name, email, password, role)
      VALUES($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role],
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(
      "Internal Server Error",
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create user",
    );
  }

  return user;
};

const loginUser = async (
  payload: LoginUserPayload,
): Promise<LoginResponsePayload> => {
  const { email, password } = payload;

  const userData = await pool.query<UserEntity>(
    `
      SELECT *
      FROM users
      WHERE email=$1
      LIMIT 1
    `,
    [email],
  );

  const user = userData.rows[0];

  if (!user) {
    throw new AppError(
      "Unauthorized",
      StatusCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const matchedPassword = await bcrypt.compare(password, user.password);

  if (!matchedPassword) {
    throw new AppError(
      "Unauthorized",
      StatusCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.secret, {
    expiresIn: "1d",
  });

  const safeUser: SafeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { token, user: safeUser };
};

export const authService = {
  registerUser,
  loginUser,
};

import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import config from "../config/index.js";
import { pool } from "../db/index.js";
import type { AuthenticatedUser, UserRole } from "../type/index.js";
import { sendErrorResponse } from "../utils/response.js";

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

const auth = (...roles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return sendErrorResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "Unauthorized",
          "Missing Authorization header",
        );
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      const decoded = jwt.verify(token, config.secret) as JwtPayload;

      if (
        typeof decoded.id !== "number" ||
        typeof decoded.name !== "string" ||
        typeof decoded.email !== "string" ||
        typeof decoded.role !== "string"
      ) {
        return sendErrorResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "Unauthorized",
          "Invalid token payload",
        );
      }

      const userResult = await pool.query<AuthenticatedUser>(
        `
          SELECT id, name, email, role, created_at, updated_at
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [decoded.id],
      );

      const user = userResult.rows[0];

      if (!user) {
        return sendErrorResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "Unauthorized",
          "User not found",
        );
      }

      req.user = user;

      if (roles.length > 0 && !roles.includes(user.role)) {
        return sendErrorResponse(
          res,
          StatusCodes.FORBIDDEN,
          "Forbidden",
          "Insufficient permissions",
        );
      }

      return next();
    } catch {
      return sendErrorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Unauthorized",
        "Missing, expired, or invalid JWT token",
      );
    }
  };
};

export default auth;

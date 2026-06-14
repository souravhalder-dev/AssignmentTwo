import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/appError.js";
import { sendErrorResponse } from "../utils/response.js";

type DatabaseError = Error & {
  code?: string;
};

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  return sendErrorResponse(
    res,
    StatusCodes.NOT_FOUND,
    "Not Found",
    "Requested resource does not exist",
  );
};

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return sendErrorResponse(res, error.statusCode, error.message, error.errors);
  }

  const dbError = error as DatabaseError;

  if (dbError.code === "23505") {
    return sendErrorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Bad Request",
      "Duplicate resource",
    );
  }

  return sendErrorResponse(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal Server Error",
    dbError.message || "Unexpected server error",
  );
};

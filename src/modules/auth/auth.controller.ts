import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendSuccessResponse } from "../../utils/response.js";
import {
  assertEnumValue,
  assertMinLength,
  assertNonEmptyString,
} from "../../utils/validation.js";
import { USER_ROLE } from "../../type/index.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const requestBody = req.body as Partial<{
    name: unknown;
    email: unknown;
    password: unknown;
    role: unknown;
  }>;

  const name = assertNonEmptyString(requestBody.name, "name");
  const email = assertNonEmptyString(requestBody.email, "email");
  const password = assertNonEmptyString(requestBody.password, "password");
  assertMinLength(password, 8, "password");
  const role = assertEnumValue(
    requestBody.role,
    [USER_ROLE.contributor, USER_ROLE.maintainer] as const,
    "role",
  );

  const user = await authService.registerUser({
    name,
    email,
    password,
    role,
  });

  return sendSuccessResponse(
    res,
    StatusCodes.CREATED,
    "User registered successfully",
    user,
  );
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const requestBody = req.body as Partial<{
    email: unknown;
    password: unknown;
  }>;

  const email = assertNonEmptyString(requestBody.email, "email");
  const password = assertNonEmptyString(requestBody.password, "password");

  const loginData = await authService.loginUser({ email, password });

  return sendSuccessResponse(
    res,
    StatusCodes.OK,
    "Login successful",
    loginData,
  );
});

export const authController = {
  registerUser,
  loginUser,
};

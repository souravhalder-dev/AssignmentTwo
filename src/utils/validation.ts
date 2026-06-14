import { StatusCodes } from "http-status-codes";
import { AppError } from "./appError.js";

export const assertNonEmptyString = (
  value: unknown,
  fieldName: string,
): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("Validation error", StatusCodes.BAD_REQUEST, `${fieldName} is required`);
  }

  return value.trim();
};

export const assertMinLength = (
  value: string,
  minLength: number,
  fieldName: string,
) => {
  if (value.length < minLength) {
    throw new AppError(
      "Validation error",
      StatusCodes.BAD_REQUEST,
      `${fieldName} must be at least ${minLength} characters`,
    );
  }
};

export const assertEnumValue = <T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string,
): T => {
  if (typeof value !== "string" || !allowedValues.includes(value as T)) {
    throw new AppError(
      "Validation error",
      StatusCodes.BAD_REQUEST,
      `${fieldName} must be ${allowedValues.join(" or ")}`,
    );
  }

  return value as T;
};

export const parseIdOrThrow = (value: string | string[] | undefined): number => {
  if (Array.isArray(value)) {
    throw new AppError("Validation error", StatusCodes.BAD_REQUEST, "Invalid id");
  }

  const parsedId = Number(value);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new AppError("Validation error", StatusCodes.BAD_REQUEST, "Invalid id");
  }

  return parsedId;
};

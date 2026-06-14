import type { Response } from "express";

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors: string;
};

export const sendSuccessResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
) => {
  const payload: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(payload);
};

export const sendMessageResponse = (
  res: Response,
  statusCode: number,
  message: string,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
  });
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors: string,
) => {
  const payload: ErrorResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(payload);
};

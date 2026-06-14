import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { issuesService } from "./issues.service.js";
import type { AuthRequest } from "../../middleware/auth.js";
import { AppError } from "../../utils/appError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import {
  sendMessageResponse,
  sendSuccessResponse,
} from "../../utils/response.js";
import {
  assertEnumValue,
  assertMinLength,
  assertNonEmptyString,
  parseIdOrThrow,
} from "../../utils/validation.js";
import {
  type GetIssuesQuery,
  type IssueStatus,
  type IssueType,
  type UpdateIssuePayload,
} from "./issues.interface.js";

const ISSUE_TYPES = ["bug", "feature_request"] as const satisfies readonly IssueType[];
const ISSUE_STATUSES = ["open", "in_progress", "resolved"] as const satisfies readonly IssueStatus[];

const issuesCreate = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    throw new AppError(
      "Unauthorized",
      StatusCodes.UNAUTHORIZED,
      "Missing user in request",
    );
  }

  const requestBody = req.body as Partial<{
    title: unknown;
    description: unknown;
    type: unknown;
  }>;

  const title = assertNonEmptyString(requestBody.title, "title");
  const description = assertNonEmptyString(requestBody.description, "description");
  assertMinLength(description, 20, "description");
  const type = assertEnumValue(requestBody.type, ISSUE_TYPES, "type");

  const issue = await issuesService.issuesPostDB(
    { title, description, type },
    userId,
  );

  return sendSuccessResponse(
    res,
    StatusCodes.CREATED,
    "Issue created successfully",
    issue,
  );
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const sortRaw = req.query.sort;
  const typeRaw = req.query.type;
  const statusRaw = req.query.status;

  const query: GetIssuesQuery = {
    sort: "newest",
  };

  if (sortRaw !== undefined) {
    query.sort = assertEnumValue(sortRaw, ["newest", "oldest"] as const, "sort");
  }

  if (typeRaw !== undefined) {
    query.type = assertEnumValue(typeRaw, ISSUE_TYPES, "type");
  }

  if (statusRaw !== undefined) {
    query.status = assertEnumValue(statusRaw, ISSUE_STATUSES, "status");
  }

  const issues = await issuesService.getIssuesDB(query);

  return sendSuccessResponse(
    res,
    StatusCodes.OK,
    "Issues retrived successfully",
    issues,
  );
});

const getSingleIssue = catchAsync(async (req: Request, res: Response) => {
  const id = parseIdOrThrow(req.params.id);
  const issue = await issuesService.getIssueByIdDB(id);

  if (!issue) {
    throw new AppError("Not Found", StatusCodes.NOT_FOUND, "Issue not found");
  }

  return sendSuccessResponse(
    res,
    StatusCodes.OK,
    "Issue retrived successfully",
    issue,
  );
});

const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    throw new AppError(
      "Unauthorized",
      StatusCodes.UNAUTHORIZED,
      "Missing user in request",
    );
  }

  const id = parseIdOrThrow(req.params.id);
  const issue = await issuesService.getRawIssueByIdDB(id);

  if (!issue) {
    throw new AppError("Not Found", StatusCodes.NOT_FOUND, "Issue not found");
  }

  if (user.role === "contributor" && issue.reporter_id !== user.id) {
    throw new AppError(
      "Forbidden",
      StatusCodes.FORBIDDEN,
      "You can only edit your own issues",
    );
  }

  if (user.role === "contributor" && issue.status !== "open") {
    throw new AppError(
      "Conflict",
      StatusCodes.CONFLICT,
      "You can only edit an issue when status is open",
    );
  }

  const requestBody = req.body as Partial<{
    title: unknown;
    description: unknown;
    type: unknown;
  }>;

  const updatePayload: UpdateIssuePayload = {};

  if (requestBody.title !== undefined) {
    updatePayload.title = assertNonEmptyString(requestBody.title, "title");
  }

  if (requestBody.description !== undefined) {
    const description = assertNonEmptyString(requestBody.description, "description");
    assertMinLength(description, 20, "description");
    updatePayload.description = description;
  }

  if (requestBody.type !== undefined) {
    updatePayload.type = assertEnumValue(requestBody.type, ISSUE_TYPES, "type");
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new AppError(
      "Validation error",
      StatusCodes.BAD_REQUEST,
      "At least one of title, description, type is required",
    );
  }

  const updatedIssue = await issuesService.updateIssueDB(id, updatePayload);

  if (!updatedIssue) {
    throw new AppError("Not Found", StatusCodes.NOT_FOUND, "Issue not found");
  }

  return sendSuccessResponse(
    res,
    StatusCodes.OK,
    "Issue updated successfully",
    updatedIssue,
  );
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    throw new AppError(
      "Unauthorized",
      StatusCodes.UNAUTHORIZED,
      "Missing user in request",
    );
  }

  const id = parseIdOrThrow(req.params.id);
  const deleted = await issuesService.deleteIssueDB(id);

  if (!deleted) {
    throw new AppError("Not Found", StatusCodes.NOT_FOUND, "Issue not found");
  }

  return sendMessageResponse(res, StatusCodes.OK, "Issue deleted successfully");
});

export const issuesController = {
  issuesCreate,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

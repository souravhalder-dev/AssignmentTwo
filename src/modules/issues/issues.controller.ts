import type { Request, Response } from "express";
import { issuesService } from "./issues.service.js";
import type { AuthRequest } from "../../middlewares/middlewares.js";

const isIssueType = (value: unknown): value is "bug" | "feature_request" =>
  value === "bug" || value === "feature_request";

const isIssueStatus = (
  value: unknown,
): value is "open" | "in_progress" | "resolved" =>
  value === "open" || value === "in_progress" || value === "resolved";

const issuesCreate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing user in request",
      });
    }

    const { title, description, type } = req.body as Partial<{
      title: unknown;
      description: unknown;
      type: unknown;
    }>;

    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "title is required",
      });
    }

    if (typeof description !== "string" || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "description must be at least 20 characters",
      });
    }

    if (!isIssueType(type)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "type must be bug or feature_request",
      });
    }

    const result = await issuesService.issuesPostDB(
      { title: title.trim(), description: description.trim(), type },
      Number(userId),
    );

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Issue creation failed",
      errors: (error as Error).message,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const sortRaw = req.query.sort;
    const typeRaw = req.query.type;
    const statusRaw = req.query.status;

    const sort =
      sortRaw === "oldest" || sortRaw === "newest" ? sortRaw : "newest";

    const type = isIssueType(typeRaw) ? typeRaw : undefined;
    const status = isIssueStatus(statusRaw) ? statusRaw : undefined;

    if (typeRaw !== undefined && !type) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "type must be bug or feature_request",
      });
    }

    if (statusRaw !== undefined && !status) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "status must be open, in_progress, or resolved",
      });
    }

    if (sortRaw !== undefined && sortRaw !== "newest" && sortRaw !== "oldest") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "sort must be newest or oldest",
      });
    }

    const query: { sort: "newest" | "oldest"; type?: "bug" | "feature_request"; status?: "open" | "in_progress" | "resolved" } =
      { sort };
    if (type) query.type = type;
    if (status) query.status = status;

    const issues = await issuesService.getIssuesDB(query);

    return res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: issues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      errors: (error as Error).message,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "Invalid id",
      });
    }

    const issue = await issuesService.getIssueByIdDB(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: issue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch issue",
      errors: (error as Error).message,
    });
  }
};

const updateIssue = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing user in request",
      });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "Invalid id",
      });
    }

    const issue = await issuesService.getRawIssueByIdDB(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Issue not found",
      });
    }

    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You can only edit your own issues",
        });
      }
      if (issue.status !== "open") {
        return res.status(409).json({
          success: false,
          message: "Conflict",
          errors: "You can only edit an issue when status is open",
        });
      }
    }

    const { title, description, type } = req.body as Partial<{
      title: unknown;
      description: unknown;
      type: unknown;
    }>;

    const updatePayload: Partial<{
      title: string;
      description: string;
      type: "bug" | "feature_request";
    }> = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: "title must be a non-empty string",
        });
      }
      updatePayload.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: "description must be at least 20 characters",
        });
      }
      updatePayload.description = description.trim();
    }

    if (type !== undefined) {
      if (!isIssueType(type)) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: "type must be bug or feature_request",
        });
      }
      updatePayload.type = type;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "At least one of title, description, type is required",
      });
    }

    const updated = await issuesService.updateIssueDB(id, updatePayload);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Issue update failed",
      errors: (error as Error).message,
    });
  }
};

const deleteIssue = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Missing user in request",
      });
    }

    if (user.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Only maintainer can delete issues",
      });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "Invalid id",
      });
    }

    const deleted = await issuesService.deleteIssueDB(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
        errors: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Issue delete failed",
      errors: (error as Error).message,
    });
  }
};

export const issuesController = {
  issuesCreate,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

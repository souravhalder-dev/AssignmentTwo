import type { Request, Response } from "express";
import { issuesService } from "./issues.service.js";

const issuesCreate = async (req: Request, res: Response) => {
  try {
    const { title, description, type, reporter_id } = req.body;

    if (!title || !description || !type || reporter_id == null) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: title, description, type, reporter_id",
      });
    }

    const result = await issuesService.issuesPostDB({
      title,
      description,
      type,
      reporter_id,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Issue creation failed",
      error: (error as Error).message,
    });
  }
};

const issuesGet = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.issuesGetDB();

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve issues",
      error: (error as Error).message,
    });
  }
};

const issuesParams = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issuesService.issuesParamsDB(id as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue found",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve issue",
      error: (error as Error).message,
    });
  }
};

const issuesUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issuesService.issuesUpdateDB(req.body, id as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Issue update failed",
      error: (error as Error).message,
    });
  }
};

const issuesDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issuesService.issuesDelete(id as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Issue delete failed",
      error: (error as Error).message,
    });
  }
};

export const issuesController = {
  issuesCreate,
  issuesGet,
  issuesParams,
  issuesUpdate,
  issuesDelete,
};

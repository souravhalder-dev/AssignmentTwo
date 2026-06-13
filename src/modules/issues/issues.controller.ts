import type { Request, Response } from "express";
import { issuesService } from "./issues.service.js";

const issuesCreate = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.issuesPostDB(req.body);
    console.log(result.rows);

    res.status(201).json({
      success: true,
      message: "User Created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User creation failed",
      error: (error as Error).message,
    });
  }
};

const issuesGet = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.issuesGetDB();

    res.status(201).json({
      success: true,
      message: "User all successfully!",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User not have ",
      error: (error as Error).message,
    });
  }
};

// const issuesGet = async (req:Request,res:Response) => {};
// const issuesGet = async (req:Request,res:Response) => {};
// const issuesGet = async (req:Request,res:Response) => {};
// const issuesGet = async (req:Request,res:Response) => {};

export const issuesController = {
  issuesCreate,
  issuesGet,
};

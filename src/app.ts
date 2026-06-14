import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { issuesRoute } from "./modules/issues/issues.route.js";
import { authRoute } from "./modules/auth/auth.route.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import { sendSuccessResponse } from "./utils/response.js";
import { StatusCodes } from "http-status-codes";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  return sendSuccessResponse(
    res,
    StatusCodes.OK,
    "Server is running",
    "Hello World!",
  );
});

app.use("/api/issues", issuesRoute);
app.use("/api/auth", authRoute);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

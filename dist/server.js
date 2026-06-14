

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/issues/issues.route.ts
import { Router } from "express";

// src/modules/issues/issues.controller.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var connectionString = process.env.CONNECTIONSTRING;
var port = process.env.PORT;
var secret = process.env.SECRET;
if (!connectionString) {
  throw new Error("Missing CONNECTIONSTRING in environment");
}
if (!secret) {
  throw new Error("Missing SECRET in environment");
}
var config = {
  connecting_string: connectionString,
  port,
  secret
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connecting_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `);
    await pool.query(`
       CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY UNIQUE,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
        type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/utils/sql.ts
var addWhereCondition = (conditions, values, column, value) => {
  values.push(value);
  conditions.push(`${column} = $${values.length}`);
};

// src/modules/issues/issues.service.ts
var issuesPostDB = async (payload, userId) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES($1,$2,$3,$4)
      RETURNING *
    `,
    [title, description, type, userId]
  );
  return result.rows[0];
};
var getIssuesDB = async (params) => {
  const conditions = [];
  const values = [];
  if (params.type) {
    addWhereCondition(conditions, values, "type", params.type);
  }
  if (params.status) {
    addWhereCondition(conditions, values, "status", params.status);
  }
  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderSql = params.sort === "oldest" ? "ASC" : "DESC";
  const issuesResult = await pool.query(
    `
      SELECT *
      FROM issues
      ${whereSql}
      ORDER BY created_at ${orderSql}
    `,
    values
  );
  const issues = issuesResult.rows;
  const reporterIds = Array.from(new Set(issues.map((i) => i.reporter_id)));
  if (reporterIds.length === 0) {
    return issues.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      type: i.type,
      status: i.status,
      reporter: null,
      created_at: i.created_at,
      updated_at: i.updated_at
    }));
  }
  const reportersResult = await pool.query(
    `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
    `,
    [reporterIds]
  );
  const reporterById = /* @__PURE__ */ new Map();
  for (const r of reportersResult.rows)
    reporterById.set(r.id, r);
  return issues.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    type: i.type,
    status: i.status,
    reporter: reporterById.get(i.reporter_id) ?? null,
    created_at: i.created_at,
    updated_at: i.updated_at
  }));
};
var getIssueByIdDB = async (id) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id=$1
      LIMIT 1
    `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue)
    return null;
  const reporterResult = await pool.query(
    `
      SELECT id, name, role
      FROM users
      WHERE id=$1
      LIMIT 1
    `,
    [issue.reporter_id]
  );
  const reporter = reporterResult.rows[0] ?? null;
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var getRawIssueByIdDB = async (id) => {
  const issueResult = await pool.query(
    `
      SELECT *
      FROM issues
      WHERE id=$1
      LIMIT 1
    `,
    [id]
  );
  return issueResult.rows[0] ?? null;
};
var updateIssueDB = async (id, payload) => {
  const fields = [];
  const values = [];
  if (payload.title !== void 0) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }
  if (payload.description !== void 0) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }
  if (payload.type !== void 0) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }
  if (fields.length === 0)
    return null;
  const setSql = `${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP`;
  values.push(id);
  const result = await pool.query(
    `
      UPDATE issues
      SET ${setSql}
      WHERE id = $${values.length}
      RETURNING *
    `,
    values
  );
  return result.rows[0] ?? null;
};
var deleteIssueDB = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM issues
      WHERE id=$1
    `,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};
var issuesService = {
  issuesPostDB,
  getIssuesDB,
  getIssueByIdDB,
  getRawIssueByIdDB,
  updateIssueDB,
  deleteIssueDB
};

// src/utils/appError.ts
var AppError = class extends Error {
  statusCode;
  errors;
  constructor(message, statusCode, errors) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors ?? message;
  }
};

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
};

// src/utils/response.ts
var sendSuccessResponse = (res, statusCode, message, data) => {
  const payload = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(payload);
};
var sendMessageResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: true,
    message
  });
};
var sendErrorResponse = (res, statusCode, message, errors) => {
  const payload = {
    success: false,
    message,
    errors
  };
  return res.status(statusCode).json(payload);
};

// src/utils/validation.ts
import { StatusCodes } from "http-status-codes";
var assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError("Validation error", StatusCodes.BAD_REQUEST, `${fieldName} is required`);
  }
  return value.trim();
};
var assertMinLength = (value, minLength, fieldName) => {
  if (value.length < minLength) {
    throw new AppError(
      "Validation error",
      StatusCodes.BAD_REQUEST,
      `${fieldName} must be at least ${minLength} characters`
    );
  }
};
var assertEnumValue = (value, allowedValues, fieldName) => {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw new AppError(
      "Validation error",
      StatusCodes.BAD_REQUEST,
      `${fieldName} must be ${allowedValues.join(" or ")}`
    );
  }
  return value;
};
var parseIdOrThrow = (value) => {
  if (Array.isArray(value)) {
    throw new AppError("Validation error", StatusCodes.BAD_REQUEST, "Invalid id");
  }
  const parsedId = Number(value);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new AppError("Validation error", StatusCodes.BAD_REQUEST, "Invalid id");
  }
  return parsedId;
};

// src/modules/issues/issues.controller.ts
var ISSUE_TYPES = ["bug", "feature_request"];
var ISSUE_STATUSES = ["open", "in_progress", "resolved"];
var issuesCreate = catchAsync(async (req, res) => {
  const authReq = req;
  const userId = authReq.user?.id;
  if (!userId) {
    throw new AppError(
      "Unauthorized",
      StatusCodes2.UNAUTHORIZED,
      "Missing user in request"
    );
  }
  const requestBody = req.body;
  const title = assertNonEmptyString(requestBody.title, "title");
  const description = assertNonEmptyString(requestBody.description, "description");
  assertMinLength(description, 20, "description");
  const type = assertEnumValue(requestBody.type, ISSUE_TYPES, "type");
  const issue = await issuesService.issuesPostDB(
    { title, description, type },
    userId
  );
  return sendSuccessResponse(
    res,
    StatusCodes2.CREATED,
    "Issue created successfully",
    issue
  );
});
var getAllIssues = catchAsync(async (req, res) => {
  const sortRaw = req.query.sort;
  const typeRaw = req.query.type;
  const statusRaw = req.query.status;
  const query = {
    sort: "newest"
  };
  if (sortRaw !== void 0) {
    query.sort = assertEnumValue(sortRaw, ["newest", "oldest"], "sort");
  }
  if (typeRaw !== void 0) {
    query.type = assertEnumValue(typeRaw, ISSUE_TYPES, "type");
  }
  if (statusRaw !== void 0) {
    query.status = assertEnumValue(statusRaw, ISSUE_STATUSES, "status");
  }
  const issues = await issuesService.getIssuesDB(query);
  return sendSuccessResponse(
    res,
    StatusCodes2.OK,
    "Issues retrived successfully",
    issues
  );
});
var getSingleIssue = catchAsync(async (req, res) => {
  const id = parseIdOrThrow(req.params.id);
  const issue = await issuesService.getIssueByIdDB(id);
  if (!issue) {
    throw new AppError("Not Found", StatusCodes2.NOT_FOUND, "Issue not found");
  }
  return sendSuccessResponse(
    res,
    StatusCodes2.OK,
    "Issue retrived successfully",
    issue
  );
});
var updateIssue = catchAsync(async (req, res) => {
  const authReq = req;
  const user = authReq.user;
  if (!user) {
    throw new AppError(
      "Unauthorized",
      StatusCodes2.UNAUTHORIZED,
      "Missing user in request"
    );
  }
  const id = parseIdOrThrow(req.params.id);
  const issue = await issuesService.getRawIssueByIdDB(id);
  if (!issue) {
    throw new AppError("Not Found", StatusCodes2.NOT_FOUND, "Issue not found");
  }
  if (user.role === "contributor" && issue.reporter_id !== user.id) {
    throw new AppError(
      "Forbidden",
      StatusCodes2.FORBIDDEN,
      "You can only edit your own issues"
    );
  }
  if (user.role === "contributor" && issue.status !== "open") {
    throw new AppError(
      "Conflict",
      StatusCodes2.CONFLICT,
      "You can only edit an issue when status is open"
    );
  }
  const requestBody = req.body;
  const updatePayload = {};
  if (requestBody.title !== void 0) {
    updatePayload.title = assertNonEmptyString(requestBody.title, "title");
  }
  if (requestBody.description !== void 0) {
    const description = assertNonEmptyString(requestBody.description, "description");
    assertMinLength(description, 20, "description");
    updatePayload.description = description;
  }
  if (requestBody.type !== void 0) {
    updatePayload.type = assertEnumValue(requestBody.type, ISSUE_TYPES, "type");
  }
  if (Object.keys(updatePayload).length === 0) {
    throw new AppError(
      "Validation error",
      StatusCodes2.BAD_REQUEST,
      "At least one of title, description, type is required"
    );
  }
  const updatedIssue = await issuesService.updateIssueDB(id, updatePayload);
  if (!updatedIssue) {
    throw new AppError("Not Found", StatusCodes2.NOT_FOUND, "Issue not found");
  }
  return sendSuccessResponse(
    res,
    StatusCodes2.OK,
    "Issue updated successfully",
    updatedIssue
  );
});
var deleteIssue = catchAsync(async (req, res) => {
  const authReq = req;
  const user = authReq.user;
  if (!user) {
    throw new AppError(
      "Unauthorized",
      StatusCodes2.UNAUTHORIZED,
      "Missing user in request"
    );
  }
  const id = parseIdOrThrow(req.params.id);
  const deleted = await issuesService.deleteIssueDB(id);
  if (!deleted) {
    throw new AppError("Not Found", StatusCodes2.NOT_FOUND, "Issue not found");
  }
  return sendMessageResponse(res, StatusCodes2.OK, "Issue deleted successfully");
});
var issuesController = {
  issuesCreate,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/type/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
import { StatusCodes as StatusCodes3 } from "http-status-codes";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return sendErrorResponse(
          res,
          StatusCodes3.UNAUTHORIZED,
          "Unauthorized",
          "Missing Authorization header"
        );
      }
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      const decoded = jwt.verify(token, config_default.secret);
      if (typeof decoded.id !== "number" || typeof decoded.name !== "string" || typeof decoded.email !== "string" || typeof decoded.role !== "string") {
        return sendErrorResponse(
          res,
          StatusCodes3.UNAUTHORIZED,
          "Unauthorized",
          "Invalid token payload"
        );
      }
      const userResult = await pool.query(
        `
          SELECT id, name, email, role, created_at, updated_at
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [decoded.id]
      );
      const user = userResult.rows[0];
      if (!user) {
        return sendErrorResponse(
          res,
          StatusCodes3.UNAUTHORIZED,
          "Unauthorized",
          "User not found"
        );
      }
      req.user = user;
      if (roles.length > 0 && !roles.includes(user.role)) {
        return sendErrorResponse(
          res,
          StatusCodes3.FORBIDDEN,
          "Forbidden",
          "Insufficient permissions"
        );
      }
      return next();
    } catch {
      return sendErrorResponse(
        res,
        StatusCodes3.UNAUTHORIZED,
        "Unauthorized",
        "Missing, expired, or invalid JWT token"
      );
    }
  };
};
var auth_default = auth;

// src/modules/issues/issues.route.ts
var route = Router();
route.get("/", issuesController.getAllIssues);
route.get("/:id", issuesController.getSingleIssue);
route.post(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.issuesCreate
);
route.patch(
  "/:id",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issuesController.updateIssue
);
route.delete(
  "/:id",
  auth_default(USER_ROLE.maintainer),
  issuesController.deleteIssue
);
var issuesRoute = route;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.controller.ts
import { StatusCodes as StatusCodes5 } from "http-status-codes";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";
import { StatusCodes as StatusCodes4 } from "http-status-codes";
var registerUser = async (payload) => {
  const { name, email, password, role } = payload;
  const existingUserResult = await pool.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );
  if (existingUserResult.rows[0]) {
    throw new AppError(
      "Bad Request",
      StatusCodes4.BAD_REQUEST,
      "Email already exists"
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users(name, email, password, role)
      VALUES($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role]
  );
  const user = result.rows[0];
  if (!user) {
    throw new AppError(
      "Internal Server Error",
      StatusCodes4.INTERNAL_SERVER_ERROR,
      "Failed to create user"
    );
  }
  return user;
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
      SELECT *
      FROM users
      WHERE email=$1
      LIMIT 1
    `,
    [email]
  );
  const user = userData.rows[0];
  if (!user) {
    throw new AppError(
      "Unauthorized",
      StatusCodes4.UNAUTHORIZED,
      "Invalid email or password"
    );
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    throw new AppError(
      "Unauthorized",
      StatusCodes4.UNAUTHORIZED,
      "Invalid email or password"
    );
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const token = jwt2.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
  return { token, user: safeUser };
};
var authService = {
  registerUser,
  loginUser
};

// src/modules/auth/auth.controller.ts
var registerUser2 = catchAsync(async (req, res) => {
  const requestBody = req.body;
  const name = assertNonEmptyString(requestBody.name, "name");
  const email = assertNonEmptyString(requestBody.email, "email");
  const password = assertNonEmptyString(requestBody.password, "password");
  assertMinLength(password, 8, "password");
  const role = assertEnumValue(
    requestBody.role,
    [USER_ROLE.contributor, USER_ROLE.maintainer],
    "role"
  );
  const user = await authService.registerUser({
    name,
    email,
    password,
    role
  });
  return sendSuccessResponse(
    res,
    StatusCodes5.CREATED,
    "User registered successfully",
    user
  );
});
var loginUser2 = catchAsync(async (req, res) => {
  const requestBody = req.body;
  const email = assertNonEmptyString(requestBody.email, "email");
  const password = assertNonEmptyString(requestBody.password, "password");
  const loginData = await authService.loginUser({ email, password });
  return sendSuccessResponse(
    res,
    StatusCodes5.OK,
    "Login successful",
    loginData
  );
});
var authController = {
  registerUser: registerUser2,
  loginUser: loginUser2
};

// src/modules/auth/auth.route.ts
var route2 = Router2();
route2.post("/signup", authController.registerUser);
route2.post("/login", authController.loginUser);
var authRoute = route2;

// src/middleware/errorHandler.ts
import { StatusCodes as StatusCodes6 } from "http-status-codes";
var notFoundHandler = (_req, res, _next) => {
  return sendErrorResponse(
    res,
    StatusCodes6.NOT_FOUND,
    "Not Found",
    "Requested resource does not exist"
  );
};
var globalErrorHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return sendErrorResponse(res, error.statusCode, error.message, error.errors);
  }
  const dbError = error;
  if (dbError.code === "23505") {
    return sendErrorResponse(
      res,
      StatusCodes6.BAD_REQUEST,
      "Bad Request",
      "Duplicate resource"
    );
  }
  return sendErrorResponse(
    res,
    StatusCodes6.INTERNAL_SERVER_ERROR,
    "Internal Server Error",
    dbError.message || "Unexpected server error"
  );
};

// src/app.ts
import { StatusCodes as StatusCodes7 } from "http-status-codes";
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  return sendSuccessResponse(
    res,
    StatusCodes7.OK,
    "Server is running",
    "Hello World!"
  );
});
app.use("/api/issues", issuesRoute);
app.use("/api/auth", authRoute);
app.use(notFoundHandler);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map
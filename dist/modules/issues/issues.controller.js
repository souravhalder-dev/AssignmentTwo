import { issuesService } from "./issues.service.js";
const issuesCreate = async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const user = req.user;
        if (!title || !description || !type) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, description, type",
            });
        }
        if (!user?.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: reporter_id not available from token",
            });
        }
        if (user.role !== "contributor" && user.role !== "maintainer") {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions to create issues",
            });
        }
        const result = await issuesService.issuesPostDB({
            title,
            description,
            type,
            reporter_id: user.id,
        });
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Issue creation failed",
            error: error.message,
        });
    }
};
const issuesGet = async (req, res) => {
    try {
        const sort = req.query.sort ?? "newest";
        const type = req.query.type;
        const status = req.query.status;
        const allowedSort = ["newest", "oldest"];
        const allowedType = ["bug", "feature_request"];
        const allowedStatus = ["open", "in_progress", "resolved"];
        if (sort && !allowedSort.includes(sort)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort value",
            });
        }
        if (type && !allowedType.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid type filter",
            });
        }
        if (status && !allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status filter",
            });
        }
        const filters = {
            sort: sort,
        };
        if (type) {
            filters.type = type;
        }
        if (status) {
            filters.status = status;
        }
        const issuesResult = await issuesService.issuesGetDB(filters);
        const issues = issuesResult.rows;
        const reporterIds = [
            ...new Set(issues.map((issue) => issue.reporter_id).filter(Boolean)),
        ];
        const reporters = await issuesService.getReportersByIds(reporterIds);
        const reporterMap = new Map(reporters.map((reporter) => [reporter.id, reporter]));
        const data = issues.map((issue) => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter: reporterMap.get(issue.reporter_id) ?? null,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
        }));
        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve issues",
            error: error.message,
        });
    }
};
const issuesParams = async (req, res) => {
    try {
        const { id } = req.params;
        const issueResult = await issuesService.issuesParamsDB(id);
        if (issueResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        const issue = issueResult.rows[0];
        const reporters = await issuesService.getReportersByIds([
            issue.reporter_id,
        ]);
        const reporter = reporters[0] ?? null;
        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                status: issue.status,
                reporter,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve issue",
            error: error.message,
        });
    }
};
const issuesUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user?.id || !user.role) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const issueResult = await issuesService.issuesParamsDB(id);
        if (issueResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        const issue = issueResult.rows[0];
        const isMaintainer = user.role === "maintainer";
        const isOwnOpenIssue = user.role === "contributor" &&
            issue.reporter_id === user.id &&
            issue.status === "open";
        if (!isMaintainer && !isOwnOpenIssue) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions to update this issue",
            });
        }
        const { title, description, type } = req.body;
        if (!title && !description && !type) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update",
            });
        }
        const result = await issuesService.issuesUpdateDB({ title, description, type }, id);
        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Issue update failed",
            error: error.message,
        });
    }
};
const issuesDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user?.id || user.role !== "maintainer") {
            return res.status(403).json({
                success: false,
                message: "Only maintainers can delete issues",
            });
        }
        const result = await issuesService.issuesDelete(id);
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Issue delete failed",
            error: error.message,
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
//# sourceMappingURL=issues.controller.js.map
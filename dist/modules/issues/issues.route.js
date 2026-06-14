import { Router } from "express";
import { issuesController } from "./issues.controller.js";
import { USER_ROLE } from "../../type/index.js";
import auth from "../../middlewares/middlewares.js";
const route = Router();
route.get("/", issuesController.getAllIssues);
route.get("/:id", issuesController.getSingleIssue);
route.post("/", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.issuesCreate);
route.patch("/:id", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.updateIssue);
route.delete("/:id", auth(USER_ROLE.maintainer), issuesController.deleteIssue);
export const issuesRoute = route;
//# sourceMappingURL=issues.route.js.map
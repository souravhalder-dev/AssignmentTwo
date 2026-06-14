import { Router } from "express";
import { issuesController } from "./issues.controller.js";
import auth from "../../middlewares/middlewares.js";
const route = Router();
route.post("/", auth(), issuesController.issuesCreate);
route.get("/", issuesController.issuesGet);
route.get("/:id", issuesController.issuesParams);
route.patch("/:id", auth(), issuesController.issuesUpdate);
route.delete("/:id", auth(), issuesController.issuesDelete);
export const issuesRoute = route;
//# sourceMappingURL=issues.route.js.map
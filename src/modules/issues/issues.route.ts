import { Router } from "express";
import { issuesController } from "./issues.controller.js";

const route = Router();

route.post("/", issuesController.issuesCreate);
route.get("/", issuesController.issuesGet);
route.get("/:id", issuesController.issuesParams);
route.put("/:id", issuesController.issuesUpdate);
route.delete("/:id", issuesController.issuesDelete);

export const issuesRoute = route;

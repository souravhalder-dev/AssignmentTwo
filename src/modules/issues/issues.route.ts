import { Router } from "express";
import { issuesController } from "./issues.controller.js";

const route = Router();

route.post("/", issuesController.issuesCreate);
route.get("/",issuesController.issuesGet)

export const issuesRoute = route;

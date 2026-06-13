import { Router } from "express";
import { authController } from "./auth.controller.js";

const route = Router();
route.post("/", authController.registerUser);
export const authRoute = {};

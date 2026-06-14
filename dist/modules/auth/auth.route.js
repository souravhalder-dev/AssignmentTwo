import { Router } from "express";
import { authController } from "./auth.controller.js";
const route = Router();
route.post("/signup", authController.registerUser);
route.post("/login", authController.loginUser);
export const authRoute = route;
//# sourceMappingURL=auth.route.js.map
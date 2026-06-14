import { authService } from "./auth.service.js";
const registerUser = async (req, res) => {
    try {
        const result = await authService.regUser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully !",
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
const loginUser = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(201).json({
            success: true,
            message: "User Login successful!",
            data: result,
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
export const authController = {
    registerUser,
    loginUser,
};
//# sourceMappingURL=auth.controller.js.map
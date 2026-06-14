import { authService } from "./auth.service.js";
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "name is required",
            });
        }
        if (typeof email !== "string" || email.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "email is required",
            });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "password must be at least 8 characters",
            });
        }
        if (role !== "contributor" && role !== "maintainer") {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "role must be contributor or maintainer",
            });
        }
        const result = await authService.regUser({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        const err = error;
        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Conflict",
                errors: "Email already exists",
            });
        }
        return res.status(500).json({
            success: false,
            message: "User registration failed",
            errors: err.message,
        });
    }
};
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || email.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "email is required",
            });
        }
        if (typeof password !== "string" || password.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "password is required",
            });
        }
        const result = await authService.loginUser({ email: email.trim(), password });
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        const err = error;
        if (err.message === "Invalid Credentials!") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "Invalid email or password",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Login failed",
            errors: err.message,
        });
    }
};
export const authController = {
    registerUser,
    loginUser,
};
//# sourceMappingURL=auth.controller.js.map
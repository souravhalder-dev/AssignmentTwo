import jwt from "jsonwebtoken";
import config from "../config/index.js";
const auth = () => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    success: false,
                    message: "Authorization header missing or invalid",
                });
            }
            const [scheme, token] = authHeader.split(" ");
            if (scheme !== "Bearer" || !token) {
                return res.status(401).json({
                    success: false,
                    message: "Authorization header missing or invalid",
                });
            }
            const jwtSecret = config.secret;
            const decoded = jwt.verify(token, jwtSecret);
            req.user = { id: decoded.id, role: decoded.role };
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                error: error.message,
            });
        }
    };
};
export default auth;
//# sourceMappingURL=middlewares.js.map
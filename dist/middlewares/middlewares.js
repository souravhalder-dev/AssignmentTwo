import jwt, {} from "jsonwebtoken";
import config from "../config/index.js";
import { pool } from "../db/index.js";
const auth = (...role) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: "User not authorized to access !!",
                    errors: "Missing Authorization header",
                });
            }
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : authHeader;
            const decoded = jwt.verify(token, config.secret);
            if (!decoded?.id) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token payload !!",
                    errors: "Missing user id in token",
                });
            }
            const userdata = await pool.query("SELECT * FROM users WHERE id=$1", [
                decoded.id,
            ]);
            if (userdata.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "User not found !!",
                    errors: "No user matches this token",
                });
            }
            const user = userdata.rows[0];
            delete user.password;
            req.user = user;
            if (role.length > 0 && !role.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden",
                    errors: "Insufficient permissions",
                });
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
export default auth;
//# sourceMappingURL=middlewares.js.map
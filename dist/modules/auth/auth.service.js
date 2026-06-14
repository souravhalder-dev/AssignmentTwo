import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
const regUser = async (payLoad) => {
    const { name, email, password, role } = payLoad;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
     INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
    `, [name, email, hashPassword, role]);
    if (result.rows.length === 0) {
        throw new Error("Invalid Credentials!");
    }
    delete result.rows[0].password;
    return result;
};
const loginUser = async (payload) => {
    const { email, password } = payload;
    // 1. Check if the user exists -> Done
    // 2. Compare the password -> Done
    //3. Generate Token -> Done
    // 1. Check if the user exists
    const userData = await pool.query(`
    SELECT * FROM users WHERE email=$1
    `, [email]);
    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials!");
    }
    // 2. Compare the password -> Done
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        throw new Error("Invalid Credentials!");
    }
    delete userData.rows[0].password;
    //3. Generate Token
    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const token = jwt.sign(jwtpayload, config.secret, {
        expiresIn: "1d",
    });
    return { token, user };
};
export const authService = {
    regUser,
    loginUser,
};
//# sourceMappingURL=auth.service.js.map
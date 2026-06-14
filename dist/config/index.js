import dotenv from "dotenv";
import path from "path";
dotenv.config({
    path: path.join(process.cwd(), ".env"),
});
const connectionString = process.env.CONNECTIONSTRING;
const port = process.env.PORT;
const secret = process.env.SECRET;
if (!connectionString) {
    throw new Error("Missing CONNECTIONSTRING in environment");
}
if (!secret) {
    throw new Error("Missing SECRET in environment");
}
const config = {
    connecting_string: connectionString,
    port,
    secret,
};
export default config;
//# sourceMappingURL=index.js.map
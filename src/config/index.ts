import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

type Config = {
  connecting_string: string;
  port: string | undefined;
  secret: string;
};

const connectionString = process.env.CONNECTIONSTRING as string;
const port = process.env.PORT;
const secret = process.env.SECRET as string;

if (!connectionString) {
  throw new Error("Missing CONNECTIONSTRING in environment");
}

if (!secret) {
  throw new Error("Missing SECRET in environment");
}

const config: Config = {
  connecting_string: connectionString,
  port,
  secret,
};

export default config;

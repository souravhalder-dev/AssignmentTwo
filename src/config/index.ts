import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connecting_string: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT,
  secret: process.env.SECRET,
};

export default config;

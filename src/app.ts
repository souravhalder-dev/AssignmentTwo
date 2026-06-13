import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { issuesRoute } from "./modules/issues/issues.route.js";
import { initDB } from "./db/index.js";
import { authRoute } from "./modules/auth/auth.route.js";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/issues", issuesRoute);
app.use("/api/auth",authRoute);
export default app;

import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { issuesRoute } from "./modules/issues/issues.route.js";
import { initDB } from "./db/index.js";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/issues", issuesRoute);

export default app;

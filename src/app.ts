import express, { type Request, type Response } from "express";
import { pool } from "./db/index.js";

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/api/issues", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const result = await pool.query(
      `
      INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *
      `,
      [name, email, password],
    );

    console.log(result.rows);

    res.status(201).json({
      success: true,
      message: "User Created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User creation failed",
      error: (error as Error).message,
    });
  }
});

export default app;

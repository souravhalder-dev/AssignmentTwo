import { Pool } from "pg";
import config from "../config/index.js";

export const pool = new Pool({
  connectionString: config.connecting_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
       CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY UNIQUE,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
        type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.log(error);
  }
};

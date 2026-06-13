import { pool } from "../../db/index.js";
import type { typeUser } from "./issues.interface.js";

const issuesPostDB = async (payLoad: typeUser) => {
  const { name, email, password } = payLoad;
  const result = await pool.query(
    `
      INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *
      `,
    [name, email, password],
  );
  return result;
};

const issuesGetDB = async () => {
  const result = pool.query(
    `
  SELECT * FROM users   
  `,
  );
  return result;
};


export const issuesService = {
  issuesPostDB,
  issuesGetDB,
};

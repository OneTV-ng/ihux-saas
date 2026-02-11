import "dotenv/config";
import * as schema from "./schema";

import { NORMALIZED_DIALECT } from "./dialect";

let db: any;

if (NORMALIZED_DIALECT === "mysql") {
  const { drizzle } = require("drizzle-orm/mysql2");
  const mysql = require("mysql2/promise");
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  db = drizzle(pool, { schema, mode: "default" });
} else {
  // postgresql
  const { drizzle } = require("drizzle-orm/node-postgres");
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  db = drizzle(pool, { schema });
}

export { db };

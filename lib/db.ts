import { Pool } from "@neondatabase/serverless";

/**
 * Get a Neon database connection
 * Uses the DATABASE_URL environment variable
 */
let pool: Pool | null = null;

export function getNeonPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 10000,
    });
  }

  return pool;
}

/**
 * Execute a SQL query
 */
export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getNeonPool();
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

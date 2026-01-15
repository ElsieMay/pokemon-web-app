import { Pool } from "@neondatabase/serverless";
import { env } from "./env";

let pool: Pool | null = null;

/**
 * Gets or creates a database connection pool.
 * @returns Pool instance
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: env.DB_IDLE_TIMEOUT,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

/**
 * Executes a SQL query with automatic retry logic.
 *
 * @param sql - SQL query string
 * @param params - Query parameters
 * @returns Query results
 * @throws Error if query fails after retries
 *
 * @example
 * ```ts
 * const users = await query<User>('SELECT * FROM users WHERE id = $1', [userId]);
 * ```
 */
export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const client = await getPool().connect();
      try {
        return (await client.query(sql, params)).rows as T[];
      } finally {
        client.release();
      }
    } catch (error) {
      // Purposely do not log the error to avoid leaking sensitive info
      // Context can be added here for more sophisticated logging if needed - prod
      if (attempt === 2) throw new Error("Database operation failed");
      pool = null;
      await new Promise((r) => setTimeout(r, 100 * attempt));
    }
  }

  throw new Error("Database operation failed");
}

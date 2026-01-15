import { Pool } from "@neondatabase/serverless";
import { env } from "./env";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: env.DB_IDLE_TIMEOUT,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const client = await getPool().connect();
      try {
        const result = await client.query(sql, params);
        return result.rows as T[];
      } finally {
        client.release();
      }
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        // Reset pool on connection failure
        pool = null;
        await new Promise((r) => setTimeout(r, 100 * attempts));
      } else {
        if (env.NODE_ENV === "development") {
          console.error("DB query failed after retries:", {
            message: error instanceof Error ? error.message : "Unknown error",
            attempts: maxAttempts,
          });
        }
        throw error;
      }
    }
  }

  throw new Error("Unreachable");
}

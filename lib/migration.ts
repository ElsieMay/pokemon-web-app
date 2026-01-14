import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import "./polyfill";

config({ path: join(__dirname, "..", ".env.local") });

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    const migrationsDir = join(__dirname, "migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`Found ${migrationFiles.length} migration(s)`);

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      await client.query(sql);
      console.log(`✓ Completed: ${file}`);
    }

    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
runMigrations();

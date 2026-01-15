import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEON_ORG_ID: z.string().min(1).optional(),
  NEON_PROJECT_ID: z.string().min(1).optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60000),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
  DB_IDLE_TIMEOUT: z.coerce.number().int().positive().default(60000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

let env: z.infer<typeof envSchema>;

// Skip validation in test environment
if (process.env.JEST_WORKER_ID) {
  env = {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "postgresql://test:test@localhost:5432/test_db",
    NEON_ORG_ID: process.env.NEON_ORG_ID,
    NEON_PROJECT_ID: process.env.NEON_PROJECT_ID,
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX),
    RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW),
    DB_POOL_MAX: Number(process.env.DB_POOL_MAX),
    DB_IDLE_TIMEOUT: Number(process.env.DB_IDLE_TIMEOUT),
    NODE_ENV: "test" as const,
  };
} else {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("🚨 Environment validation failed:");
    console.error(errors);
    console.error("\n💡 Copy .env.example → .env and fill required values");

    // Fail fast - don't start broken app
    process.exit(1);
  }

  env = result.data;
}

export { env };

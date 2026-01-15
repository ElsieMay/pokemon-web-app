import type { Config } from "jest";
import nextJest from "next/jest.js";

process.env.JEST_WORKER_ID = "1";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.NEON_ORG_ID = "test_org";
process.env.NEON_PROJECT_ID = "test_project";
process.env.RATE_LIMIT_MAX = "10";
process.env.RATE_LIMIT_WINDOW = "60000";
process.env.DB_POOL_MAX = "5";
process.env.DB_IDLE_TIMEOUT = "60000";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!app/layout.tsx",
    "!app/**/layout.tsx",
  ],
};

export default createJestConfig(config);

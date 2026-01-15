import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.JEST_WORKER_ID = "1";
process.env.NEON_ORG_ID = "test_org";
process.env.NEON_PROJECT_ID = "test_project";
process.env.RATE_LIMIT_MAX = "10";
process.env.RATE_LIMIT_WINDOW = "60000";
process.env.DB_POOL_MAX = "5";
process.env.DB_IDLE_TIMEOUT = "60000";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

Object.defineProperty(global, "TextEncoder", {
  value: TextEncoder,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, "TextDecoder", {
  value: TextDecoder,
  writable: true,
  configurable: true,
});

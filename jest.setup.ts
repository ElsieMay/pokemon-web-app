import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
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

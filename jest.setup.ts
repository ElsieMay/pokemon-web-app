import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

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

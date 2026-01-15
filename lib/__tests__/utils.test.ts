import { Pokemon } from "@/types/pokemon";
import {
  createErrorResponse,
  getFirstEnglishDescription,
  validateText,
  validateTranslationInput,
  validateUserId,
} from "../utils";

describe("Rate Limiting", () => {
  const mockHeaders = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.resetModules();

    jest.doMock("next/headers", () => ({
      headers: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("isRateLimited", () => {
    it("allows first request within window", async () => {
      const { headers } = await import("next/headers");
      const { isRateLimited } = await import("../utils");

      mockHeaders.get.mockReturnValue("192.168.1.1");
      (headers as jest.Mock).mockResolvedValue(mockHeaders);

      const result = await isRateLimited();
      expect(result).toBe(false);
    });

    it("blocks requests exceeding the limit", async () => {
      const { headers } = await import("next/headers");
      const { isRateLimited } = await import("../utils");

      mockHeaders.get.mockReturnValue("192.168.1.1");
      (headers as jest.Mock).mockResolvedValue(mockHeaders);
      const MAX_REQUESTS = 3;
      for (let i = 0; i < MAX_REQUESTS; i++) {
        const result = await isRateLimited({ maxRequests: MAX_REQUESTS });
        expect(result).toBe(false);
      }
      const blockedResult = await isRateLimited({ maxRequests: MAX_REQUESTS });
      expect(blockedResult).toBe(true);
    });

    it("defaults to 127.0.0.1 when x-forwarded-for header is missing", async () => {
      const { headers } = await import("next/headers");
      const { isRateLimited } = await import("../utils");

      mockHeaders.get.mockReturnValue(null);
      (headers as jest.Mock).mockResolvedValue(mockHeaders);

      const result = await isRateLimited();
      expect(result).toBe(false);
    });

    it("should execute cleanup logic when random condition is met", async () => {
      const { headers } = await import("next/headers");
      const { isRateLimited } = await import("../utils");

      const mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.005);

      mockHeaders.get.mockReturnValue("192.168.1.2");
      (headers as jest.Mock).mockResolvedValue(mockHeaders);

      const MAX_REQUESTS = 3;
      const WINDOW_MS = 1000;

      for (let i = 0; i < MAX_REQUESTS; i++) {
        await isRateLimited({ maxRequests: MAX_REQUESTS, windowMs: WINDOW_MS });
      }

      jest.advanceTimersByTime(WINDOW_MS + 1);

      mockHeaders.get.mockReturnValue("192.168.1.3");
      await isRateLimited({ maxRequests: MAX_REQUESTS, windowMs: WINDOW_MS });

      mockHeaders.get.mockReturnValue("192.168.1.2");
      const result = await isRateLimited({
        maxRequests: MAX_REQUESTS,
        windowMs: WINDOW_MS,
      });
      expect(result).toBe(false);

      mathRandomSpy.mockRestore();
    });

    it("should not execute cleanup logic when random condition is not met", async () => {
      const { headers } = await import("next/headers");
      const { isRateLimited } = await import("../utils");

      const mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);

      mockHeaders.get.mockReturnValue("192.168.1.4");
      (headers as jest.Mock).mockResolvedValue(mockHeaders);

      const result = await isRateLimited();

      expect(result).toBe(false);

      mathRandomSpy.mockRestore();
    });
  });

  describe("getFirstEnglishDescription", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should return the first English description", () => {
      const pokemonData = {
        flavor_text_entries: [
          { flavor_text: "Texto en español", language: { name: "es" } },
          { flavor_text: "English text here.", language: { name: "en" } },
          { flavor_text: "Autre texte français", language: { name: "fr" } },
        ],
      } as unknown as Pokemon;

      const description = getFirstEnglishDescription(pokemonData);
      expect(description).toBe("English text here.");
    });

    it("should return an empty string if no English description is found", () => {
      const pokemonData = {
        flavor_text_entries: [
          { flavor_text: "Texto en español", language: { name: "es" } },
          { flavor_text: "Autre texte français", language: { name: "fr" } },
        ],
      } as unknown as Pokemon;

      const description = getFirstEnglishDescription(pokemonData);
      expect(description).toBe(null);
    });
  });

  describe("validateText", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return the sanitized name for valid input", () => {
      const name = validateText("  Bulbasaur  ", { maxLength: 100 });
      expect(name).toBe("Bulbasaur");
    });

    it("should throw an error for names that are too long", () => {
      expect(() =>
        validateText("A".repeat(50), {
          maxLength: 30,
          fieldName: "Pokemon name",
        })
      ).toThrow("Pokemon name too long (max 30 characters)");
    });

    it("should return empty string for whitespace-only input", () => {
      const name = validateText("   ", { maxLength: 100 });
      expect(name).toBe("");
    });

    it("should remove control characters from the name", () => {
      const name = validateText("Char\x00mander", { maxLength: 100 });
      expect(name).toBe("Charmander");
    });

    it("should allow names with accented characters", () => {
      const name = validateText("Flabébé", { maxLength: 100 });
      expect(name).toBe("Flabébé");
    });
  });

  describe("validateUserId", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should throw an error when user ID is empty", () => {
      expect(() => validateUserId("")).toThrow("User ID is required");
    });

    it("should not throw an error for valid user ID format", () => {
      expect(() =>
        validateUserId("123e4567-e89b-12d3-a456-426614174000")
      ).not.toThrow();
    });

    it("should not throw an error when user ID is valid", () => {
      expect(() =>
        validateUserId("550e8400-e29b-41d4-a716-446655440000")
      ).not.toThrow();
    });
  });

  describe("validateTranslationInput", () => {
    it("should throw an error for empty descriptions", () => {
      expect(() => validateTranslationInput("")).toThrow(
        "Description cannot be empty"
      );
    });

    it("should throw an error for descriptions that are too long", () => {
      expect(() => validateTranslationInput("A".repeat(600))).toThrow(
        "Description too long (max 500 characters)"
      );
    });

    it("should return the sanitized description for valid input", () => {
      const description = validateTranslationInput("A valid description.");
      expect(description).toBe("A valid description.");
    });

    it("should remove control characters from the description", () => {
      const description = validateTranslationInput("Hello\x00World\x1F!");
      expect(description).toBe("HelloWorld!");
      expect(description).not.toMatch(/[\x00-\x1F\x7F]/);
    });
  });

  describe("createErrorResponse", () => {
    const defaultErrorMessage = "An unknown error occurred";

    it("should only console log actual error details in dev environment", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const envSpy = jest.replaceProperty(
        process.env,
        "NODE_ENV",
        "development"
      );

      createErrorResponse(new Error("Test error"));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error details:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      envSpy.restore();
    });

    it("if no error instance passed, should use default message in develop env", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const envSpy = jest.replaceProperty(
        process.env,
        "NODE_ENV",
        "development"
      );

      const errorResponse = createErrorResponse("Some string error");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error details:",
        "Some string error"
      );
      expect(errorResponse).toHaveProperty("error", defaultErrorMessage);
      envSpy.restore();
    });

    it("should not log in production environment", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const envSpy = jest.replaceProperty(
        process.env,
        "NODE_ENV",
        "production"
      );

      createErrorResponse(new Error("Test error"));

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      envSpy.restore();
    });

    it("should create a standardized error response", () => {
      const errorResponse = createErrorResponse(
        new Error("Something went wrong")
      );

      expect(errorResponse).toHaveProperty("success", false);
      expect(errorResponse).toHaveProperty("error", defaultErrorMessage);
    });

    it("should use default message for non-Error types", () => {
      const errorResponse = createErrorResponse(
        "Not an Error object",
        "Custom default"
      );

      expect(errorResponse).toHaveProperty("success", false);
      expect(errorResponse).toHaveProperty("error", "Custom default");
    });

    it("should handle unknown error types", () => {
      const errorResponse = createErrorResponse({ unknown: "object" });

      expect(errorResponse).toHaveProperty("success", false);
      expect(errorResponse).toHaveProperty("error", defaultErrorMessage);
    });
  });
});

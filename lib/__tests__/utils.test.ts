import { Pokemon } from "@/types/pokemon";
import {
  createErrorResponse,
  getFirstEnglishDescription,
  validateDescription,
  validatePokemonName,
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

    it("cleans up expired rate limit records during request", async () => {
      const { headers } = await import("next/headers");
      const { isRateLimited, requestCounts } = await import("../utils");

      mockHeaders.get.mockReturnValue("192.168.1.100");
      (headers as jest.Mock).mockResolvedValue(mockHeaders);

      const pastTime = Date.now() - 10000;
      requestCounts.set("rate_limit:192.168.1.99", {
        count: 10,
        resetAt: pastTime,
      });

      const sizeBefore = requestCounts.size;

      await isRateLimited();

      expect(requestCounts.has("rate_limit:192.168.1.99")).toBe(false);
      expect(requestCounts.size).toBeLessThanOrEqual(sizeBefore);
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

  describe("validatePokemonName", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should throw an error for names with invalid characters", () => {
      expect(() => validatePokemonName("Pikachu!")).toThrow(
        "Pokemon name contains invalid characters"
      );
    });

    it("should return the sanitized name for valid input", () => {
      const name = validatePokemonName("  Bulbasaur  ");
      expect(name).toBe("Bulbasaur");
    });

    it("should throw an error for names that are too long", () => {
      const longName = "A".repeat(510);
      expect(() => validatePokemonName(longName)).toThrow(
        "Pokemon name too long"
      );
    });

    it("should throw an error for names that are too short", () => {
      expect(() => validatePokemonName("")).toThrow("Pokemon name is required");
    });

    it("should remove control characters from the name", () => {
      const name = validatePokemonName("Char\x00mander");
      expect(name).toBe("Charmander");
    });

    it("should allow names with accented characters", () => {
      const name = validatePokemonName("Flabébé");
      expect(name).toBe("Flabébé");
    });
  });

  describe("validateDescription", () => {
    it("should throw an error for descriptions that are too long", () => {
      expect(() => validateDescription("A".repeat(300), 200)).toThrow(
        "Description too long (max 200 characters)"
      );
    });

    it("should return the sanitized description for valid input", () => {
      const description = validateDescription("  A friendly Pokémon.  ", 50);
      expect(description).toBe("A friendly Pokémon.");
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

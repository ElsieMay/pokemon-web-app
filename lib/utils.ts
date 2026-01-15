import {
  PokemonFetchError,
  TranslationFetchError,
  FavouriteStoreError,
} from "@/types/error";
import { Pokemon } from "@/types/pokemon";
import { headers } from "next/headers";

export const requestCounts = new Map<
  string,
  { count: number; resetAt: number }
>();

/**
 * Simple in-memory rate limiter
 * This can be replaced with a more robust solution (e.g., Redis) for production use.
 */
const requestLog = new Map<string, number[]>();

export async function isRateLimited(options?: {
  maxRequests?: number;
  windowMs?: number;
}): Promise<boolean> {
  const { env } = await import("./env");

  const maxRequests = options?.maxRequests ?? env.RATE_LIMIT_MAX;
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW;

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const now = Date.now();
  const windowStart = now - windowMs;
  const requests = requestLog.get(ip) || [];
  const recentRequests = requests.filter((time) => time > windowStart);

  if (recentRequests.length >= maxRequests) {
    return true;
  }

  recentRequests.push(now);
  requestLog.set(ip, recentRequests);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, times] of requestLog.entries()) {
      const recent = times.filter((t) => t > windowStart);
      if (recent.length === 0) {
        requestLog.delete(key);
      } else {
        requestLog.set(key, recent);
      }
    }
  }

  return false;
}

/**
 * Gets the first English description from Pokemon data.
 *
 * @param pokemon - Pokemon object with flavor_text_entries
 * @returns First English description or null if none found
 *
 * @example
 * ```ts
 * const description = getFirstEnglishDescription(pokemon);
 * // "When BURMY evolved, its cloak became a part of this Pokémon's body..."
 * ```
 */
export function getFirstEnglishDescription(pokemon: Pokemon): string | null {
  if (!pokemon.flavor_text_entries?.length) return null;

  const firstEntry = pokemon.flavor_text_entries.find(
    (entry) => entry.language.name === "en"
  );

  if (!firstEntry) return null;

  // Clean up the flavor text by replacing form feed and newline characters with spaces
  return firstEntry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ").trim();
}

/**
 * Validates and returns userId, throws if invalid
 * @param userId - Optional user ID to validate
 * @throws Error if userId format is invalid
 */
export function validateUserId(userId: string): void {
  if (!userId || userId.trim().length === 0) {
    throw new Error("User ID is required");
  }
}

/**
 * Validates translation input description
 * - Ensures non-empty
 * - Validates length
 * - Removes control characters
 */
export function validateTranslationInput(description: string): string {
  const MAX_LENGTH = 500;
  if (!description || description.trim().length === 0) {
    throw new Error("Description cannot be empty");
  }
  if (description.length > MAX_LENGTH) {
    throw new Error(`Description too long (max ${MAX_LENGTH} characters)`);
  }

  return description.replace(/[\x00-\x1F\x7F]/g, "");
}

/**
 * Standard rate limit response
 */
export const rateLimitResponse = {
  success: false as const,
  error: "Too many requests. Please try again later.",
  status: 429,
};

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An unknown error occurred"
): { success: false; error: string; status: number } {
  if (process.env.NODE_ENV === "development") {
    console.error("Error details:", error);
  }

  if (
    error instanceof PokemonFetchError ||
    error instanceof TranslationFetchError ||
    error instanceof FavouriteStoreError
  ) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  return {
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : defaultMessage
        : defaultMessage,
    status: 500,
  };
}

/**
 * Validates and sanitizes text input
 * - Trims whitespace
 * - Validates length
 * - Normalizes unicode characters
 * - Removes control characters
 *
 * @param text - Input text to validate
 * @param options - Validation options
 * @returns Sanitized text
 *
 * @example
 * ```ts
 * const cleanText = validateText(userInput, { maxLength: 1000, fieldName: "Comment" });
 * ```
 */
export function validateText(
  text: string,
  options: { maxLength: number; fieldName?: string } = { maxLength: 5000 }
): string {
  const trimmed = text.trim();
  if (trimmed.length > options.maxLength) {
    const field = options.fieldName;
    throw new Error(`${field} too long (max ${options.maxLength} characters)`);
  }
  return trimmed
    .normalize("NFC")
    .replace(/[\u0000\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

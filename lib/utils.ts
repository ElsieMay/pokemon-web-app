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
interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
}

/**
 *
 * Checks if the incoming request is rate limited based on IP address.
 * @param config - Rate limit configuration
 * @returns true if rate limited, false otherwise
 *
 * @example
 * ```ts
 * const limited = await isRateLimited({ windowMs: 60000, maxRequests: 10 });
 * if (limited) {
 *   return rateLimitResponse;
 * }
 * ```
 */
export async function isRateLimited(
  config: RateLimitConfig = {}
): Promise<boolean> {
  const WINDOW_MS = config.windowMs ?? 60 * 1000;
  const MAX_REQUESTS = config.maxRequests ?? 10;

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const now = Date.now();
  const key = `rate_limit:${ip}`;

  // Lazy cleanup on every request (serverless safe)
  for (const [k, record] of requestCounts.entries()) {
    if (record.resetAt < now) requestCounts.delete(k);
  }

  const record = requestCounts.get(key);
  if (!record || record.resetAt < now) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS) return true;
  record.count++;
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

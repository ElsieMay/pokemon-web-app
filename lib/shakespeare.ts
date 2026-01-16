import { TranslationFetchError } from "@/types/error";
import { API_SHAKESPEARE_TRANSLATION_URL } from "./config";
import { validateTranslationInput } from "./utils";

/**
 * Post request to Shakespeare translation API.
 *
 * @param description - The description text to translate
 * @returns A promise resolving to the translated text
 *
 * @example
 * ```ts
 * // Translate a description to Shakespearean English
 * const translated = await translatePokemonDescription("A brave Pokemon.");
 * ```
 */
export async function fetchPokemonTranslation(description: string) {
  try {
    const sanitized = validateTranslationInput(description);

    const response = await fetch(`${API_SHAKESPEARE_TRANSLATION_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: sanitized,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new TranslationFetchError(
        `Failed to translate description: ${response.statusText}`,
        response.status
      );
    }
    const data = await response.json();
    if (!data?.contents?.translated) {
      throw new TranslationFetchError(
        "Invalid response from translation API",
        500
      );
    }
    return data.contents.translated;
  } catch (error) {
    if (error instanceof TranslationFetchError) throw error;
    throw new TranslationFetchError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      { cause: error }
    );
  }
}

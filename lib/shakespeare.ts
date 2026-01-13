import { TranslationFetchError } from "@/types/error";
import {
  API_SHAKESPEARE_TRANSLATION_URL,
  CACHE_REVALIDATE_TIME,
} from "./config";

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
    const response = await fetch(`${API_SHAKESPEARE_TRANSLATION_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: description,
      }),
      next: { revalidate: CACHE_REVALIDATE_TIME },
    });
    if (!response.ok) {
      throw new TranslationFetchError(
        `Failed to translate description: ${response.statusText}`,
        response.status
      );
    }
    const data = await response.json();
    return data.contents.translated;
  } catch (error) {
    if (error instanceof TranslationFetchError) {
      throw error;
    } else if (error instanceof Error) {
      throw new TranslationFetchError(error.message, 500);
    } else {
      throw new TranslationFetchError("An unknown error occurred", 500);
    }
  }
}

import { Pokemon } from "@/types/pokemon";

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

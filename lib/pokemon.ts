import { PokemonListSchema, PokemonSchema } from "@/types/pokemon";
import { API_POKE_BASE_URL, CACHE_REVALIDATE_TIME } from "./config";
import { PokemonFetchError } from "@/types/error";

/**
 * Fetches a paginated list of Pokemon species from the PokeAPI.
 *
 * @param limit - Maximum number of Pokemon to fetch (default: 20)
 * @param offset - Starting position for pagination (default: 0)
 * @returns A promise resolving to an array of Pokemon objects (currently only includes names)
 * @throws {PokemonFetchError} When the API request fails or returns invalid data
 *
 * @example
 * ```ts
 * const pokemon = await fetchPokemons(20, 0);
 *
 * const morePokemon = await fetchPokemons(20, 20);
 * ```
 */
export async function fetchPokemons(limit: number = 20, offset: number = 0) {
  try {
    const response = await fetch(
      `${API_POKE_BASE_URL}/pokemon-species?limit=${limit}&offset=${offset}`,
      {
        next: { revalidate: CACHE_REVALIDATE_TIME },
      }
    );
    if (!response.ok) {
      throw new PokemonFetchError(
        `Failed to fetch Pokemons: ${response.statusText}`,
        response.status
      );
    }
    const data = await response.json();
    return PokemonListSchema.parse(data).results;
  } catch (error) {
    if (error instanceof PokemonFetchError) throw error;
    throw new PokemonFetchError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      { cause: error }
    );
  }
}

/**
 * Fetches a Pokemon species from the PokeAPI.
 *
 * @param name - The name of the Pokemon species to fetch
 * @returns A promise resolving to the Pokemon species data
 * @throws {PokemonFetchError} When the API request fails
 *
 * @example
 * ```ts
 * const bulbasaur = await fetchPokemonByName("bulbasaur");
 * ```
 */
export async function fetchPokemonByName(name: string) {
  try {
    const response = await fetch(
      `${API_POKE_BASE_URL}/pokemon-species/${name}`,
      {
        next: { revalidate: CACHE_REVALIDATE_TIME },
      }
    );
    if (!response.ok) {
      throw new PokemonFetchError(
        `Failed to fetch ${name}, error: ${response.statusText}`,
        response.status
      );
    }
    const data = await response.json();
    const validated = PokemonSchema.parse(data);
    return {
      name: validated.name,
      flavor_text_entries: validated.flavor_text_entries,
      id: validated.id,
    };
  } catch (error) {
    if (error instanceof PokemonFetchError) throw error;
    throw new PokemonFetchError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      { cause: error }
    );
  }
}

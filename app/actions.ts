"use server";

import { POKEMON_SPECIES_LIMIT } from "@/lib/config";
import { fetchPokemonByName, fetchPokemons } from "@/lib/pokemon";
import { ApiResponse } from "@/types/api";
import { PokemonFetchError } from "@/types/error";
import { Pokemon } from "@/types/pokemon";

/**
 * Server action to load a list of Pokemon species from the PokeAPI.
 *
 * This is a Next.js server action that fetches Pokemon data with pagination support.
 * It handles errors gracefully and returns a structured API response.
 *
 * @param offset - The starting position for pagination (default: 0)
 * @returns A promise resolving to an ApiResponse containing Pokemon data or error details
 *
 * @example
 * ```tsx
 * const result = await loadPokemons(0);
 * if (result.success) {
 *   console.log(result.data); // Pokemon[]
 * } else {
 *   console.error(result.error, result.status);
 * }
 * ```
 */
export async function loadPokemons(
  offset: number = 0
): Promise<ApiResponse<Pokemon[]>> {
  try {
    const pokemonList = await fetchPokemons(POKEMON_SPECIES_LIMIT, offset);
    return {
      success: true,
      data: pokemonList,
    };
  } catch (error) {
    if (error instanceof PokemonFetchError) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching Pokemons",
      status: 500,
    };
  }
}

/**
 * Server action to search for a Pokemon species by name from the PokeAPI.
 *
 * This is a Next.js server action that fetches a single Pokemon by its name.
 * It handles errors gracefully and returns a structured API response.
 *
 * @param name - The name of the Pokemon species to search for
 * @returns A promise resolving to an ApiResponse containing the Pokemon data or error details
 *
 * @example
 * ```tsx
 * const result = await searchPokemonByName("Bagworm");
 * if (result.success) {
 *   console.log(result.data); // Pokemon
 * } else {
 *   console.error(result.error, result.status);
 * }
 * ```
 */
export async function searchPokemonByName(
  name: string
): Promise<ApiResponse<Pokemon>> {
  try {
    const pokemon = await fetchPokemonByName(name);
    return {
      success: true,
      data: pokemon,
    };
  } catch (error) {
    if (error instanceof PokemonFetchError) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching the Pokemon",
      status: 500,
    };
  }
}

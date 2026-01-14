"use server";

import { getSessionId } from "@/lib/session";
import { addFavourite } from "@/lib/favourites";
import { FavouritePokemon } from "@/types/favourite";
import { POKEMON_SPECIES_LIMIT } from "@/lib/config";
import { fetchPokemonByName, fetchPokemons } from "@/lib/pokemon";
import { ApiResponse } from "@/types/api";
import { PokemonDetails, PokemonList } from "@/types/pokemon";
import {
  createErrorResponse,
  getFirstEnglishDescription,
  isRateLimited,
  rateLimitResponse,
} from "@/lib/utils";
import { fetchPokemonTranslation } from "@/lib/shakespeare";

/**
 * Server action to load a list of Pokemon species from the PokeAPI.
 * @param offset - The starting position for pagination (default: 0)
 * @returns A promise resolving to an ApiResponse containing Pokemon data or error details
 * @example
 * ```tsx
 * const result = await loadPokemons(0);
 * ```
 */
export async function loadPokemons(
  offset: number = 0
): Promise<ApiResponse<PokemonList>> {
  try {
    if (await isRateLimited({ maxRequests: 5 })) {
      return rateLimitResponse;
    }
    const pokemonList = await fetchPokemons(POKEMON_SPECIES_LIMIT, offset);
    return {
      success: true,
      data: { results: pokemonList },
    };
  } catch (error) {
    return createErrorResponse(
      error,
      "An unknown error occurred while fetching Pokemons"
    );
  }
}

/**
 * Server action to search for a Pokemon species by name from the PokeAPI.
 * @param name - The name of the Pokemon species to search for
 * @returns A promise resolving to an ApiResponse containing the Pokemon details or error details
 * @example
 * ```tsx
 * const result = await searchPokemonByName("Wormadam");
 * ```
 */
export async function searchPokemonByName(
  name: string
): Promise<ApiResponse<PokemonDetails>> {
  try {
    if (await isRateLimited({ maxRequests: 5 })) {
      return rateLimitResponse;
    }
    const pokemon = await fetchPokemonByName(name);
    return {
      success: true,
      data: {
        name: pokemon.name,
        description: getFirstEnglishDescription(pokemon),
        id: pokemon.id,
      },
    };
  } catch (error) {
    return createErrorResponse(
      error,
      "An unknown error occurred while fetching the Pokemon"
    );
  }
}

/**
 * Translates a Pokemon description to Shakespearean English
 * @param description - The description to translate
 * @returns ApiResponse containing the translated description or error
 */
export async function translatePokemonDescription(
  description: string
): Promise<ApiResponse<string>> {
  try {
    if (await isRateLimited({ maxRequests: 5 })) {
      return rateLimitResponse;
    }
    const translatedDescription = await fetchPokemonTranslation(description);
    return {
      success: true,
      data: translatedDescription,
    };
  } catch (error) {
    return createErrorResponse(
      error,
      "An unknown error occurred while translating the description"
    );
  }
}

/**
 * Add a Pokemon to the current user's favourites
 */
export async function addToFavourites(
  favourite: FavouritePokemon
): Promise<ApiResponse<FavouritePokemon>> {
  try {
    const userId = await getSessionId();
    if (await isRateLimited({ maxRequests: 5 })) {
      return rateLimitResponse;
    }
    const savedFavourite = await addFavourite(
      favourite.pokemon_name,
      favourite.pokemon_id,
      favourite.shakespearean_description,
      favourite.original_description,
      userId
    );

    return {
      success: true,
      data: savedFavourite,
    };
  } catch (error) {
    return createErrorResponse(
      error,
      "An unknown error occurred while adding to favourites"
    );
  }
}

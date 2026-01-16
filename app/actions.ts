"use server";

import { getOrCreateSession } from "@/lib/session";
import { addFavourite, deleteFavourite, getFavourites } from "@/lib/favourites";
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
import { revalidatePath } from "next/cache";

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
    if (await isRateLimited()) {
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
    if (await isRateLimited()) {
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
    if (await isRateLimited()) {
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
    const userId = await getOrCreateSession();
    if (await isRateLimited()) {
      return rateLimitResponse;
    }
    const savedFavourite = await addFavourite(
      favourite.pokemon_name,
      favourite.pokemon_id,
      favourite.shakespearean_description,
      favourite.original_description,
      userId
    );

    revalidatePath("/");

    return {
      success: true,
      data: savedFavourite,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return {
        success: false,
        error: "This Pokémon is already in your favourites",
        status: 409,
      };
    }
    return createErrorResponse(
      error,
      "An unknown error occurred while adding to favourites"
    );
  }
}

/**
 * Get all Favourite Pokemons for the current session user
 */
export async function getAllFavourites(): Promise<
  ApiResponse<FavouritePokemon[] | null>
> {
  try {
    if (await isRateLimited()) {
      return rateLimitResponse;
    }
    const userId = await getOrCreateSession();
    const favourites = await getFavourites(userId);

    return {
      success: true,
      data: favourites,
    };
  } catch (error) {
    return createErrorResponse(
      error,
      "An unknown error occurred while fetching favourites"
    );
  }
}

/**
 *  Delete a Favourite Pokemon by its ID
 */
export async function deleteFavouriteById(
  pokemonId: number
): Promise<ApiResponse<null>> {
  try {
    if (await isRateLimited()) {
      return rateLimitResponse;
    }

    const userId = await getOrCreateSession();
    await deleteFavourite(pokemonId, userId);

    revalidatePath("/");

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    return createErrorResponse(
      error,
      "An unknown error occurred while deleting the favourite"
    );
  }
}

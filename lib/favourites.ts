"use server";

import { query } from "./db";
import { FavouritePokemon, FavouritePokemonSchema } from "@/types/favourite";
import { validateText, validateUserId } from "./utils";
import { getSessionId } from "./session";

/**
 * Add a Pokemon to favourites
 */
export async function addFavourite(
  pokemonName: string,
  pokemonId: number,
  shakespeareanDescription: string,
  originalDescription: string,
  userId: string
): Promise<FavouritePokemon> {
  // Validate and sanitise inputs
  const validatedName = validateText(pokemonName);
  const validatedShakespearean = validateText(shakespeareanDescription, {
    maxLength: 5000,
  });
  const validatedOriginal = validateText(originalDescription, {
    maxLength: 5000,
  });
  validateUserId(userId);

  const result = await query<FavouritePokemon>(
    `INSERT INTO favourites (pokemon_name, pokemon_id, user_id, shakespearean_description, original_description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, pokemon_name, pokemon_id, user_id, created_at, shakespearean_description, original_description`,
    [
      validatedName,
      pokemonId,
      userId,
      validatedShakespearean,
      validatedOriginal,
    ]
  );

  if (!result[0]) {
    throw new Error("Failed to add favourite");
  }

  return FavouritePokemonSchema.parse(result[0]);
}

/**
 * Get all favourite Pokemons for a user
 */
export async function getFavourites(
  userId: string
): Promise<FavouritePokemon[]> {
  validateUserId(userId);

  const result = await query<FavouritePokemon>(
    `SELECT pokemon_name, pokemon_id, created_at, shakespearean_description, original_description 
     FROM favourites 
     WHERE user_id = $1`,
    [userId]
  );

  return result.map((fav) => FavouritePokemonSchema.parse(fav));
}

/**
 * Delete a favourite Pokemon by its ID
 */
export async function deleteFavourite(
  pokemonId: number,
  userId: string
): Promise<void> {
  validateUserId(userId);

  const result = await query<{ deleted: number }>(
    `DELETE FROM favourites 
     WHERE pokemon_id = $1 AND user_id = $2
     RETURNING 1 as deleted`,
    [pokemonId, userId]
  );

  if (result.length === 0) {
    throw new Error("Failed to delete favourite");
  }

  return;
}

/**
 * Server-side function to fetch favourites
 */
export async function fetchFavouritesForSession() {
  const userId = await getSessionId();
  return await getFavourites(userId);
}

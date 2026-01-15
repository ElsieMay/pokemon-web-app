import { query } from "./db";
import { FavouritePokemon, FavouritePokemonSchema } from "@/types/favourite";
import {
  validatePokemonName,
  validateDescription,
  validateUserId,
} from "./utils";

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
  const validatedName = validatePokemonName(pokemonName);
  const validatedShakespearean = validateDescription(
    shakespeareanDescription,
    5000
  );
  const validatedOriginal = validateDescription(originalDescription, 5000);
  validateUserId(userId);

  const result = await query<FavouritePokemon>(
    `INSERT INTO favourites (pokemon_name, pokemon_id, user_id, shakespearean_description, original_description)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (pokemon_id, user_id) DO UPDATE
     SET pokemon_name = EXCLUDED.pokemon_name,
         shakespearean_description = EXCLUDED.shakespearean_description,
         original_description = EXCLUDED.original_description
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
 * @returns An object indicating if the deletion was successful and the number of rows affected
 */
export async function deleteFavourite(
  favouriteId: number,
  userId: string
): Promise<void> {
  validateUserId(userId);

  const result = await query<{ id: number }>(
    `DELETE FROM favourites 
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [favouriteId, userId]
  );

  if (!result[0]) {
    throw new Error("Failed to delete favourite");
  }

  return;
}

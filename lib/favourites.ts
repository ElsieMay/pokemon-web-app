import { query } from "./db";
import { FavouritePokemon, FavouritePokemonSchema } from "@/types/favourite";

/**
 * Add a Pokemon to favourites
 */
export async function addFavourite(
  pokemonName: string,
  pokemonId: number,
  shakespeareanDescription: string,
  originalDescription: string,
  userId?: string
): Promise<FavouritePokemon> {
  const result = await query<FavouritePokemon>(
    `INSERT INTO favourites (pokemon_name, pokemon_id, user_id, shakespearean_description, original_description)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (pokemon_id, user_id) DO UPDATE
     SET pokemon_name = EXCLUDED.pokemon_name,
         shakespearean_description = EXCLUDED.shakespearean_description,
         original_description = EXCLUDED.original_description
     RETURNING *`,
    [
      pokemonName,
      pokemonId,
      userId || null,
      shakespeareanDescription,
      originalDescription,
    ]
  );

  if (!result[0]) {
    throw new Error("Failed to add favourite");
  }

  return FavouritePokemonSchema.parse(result[0]);
}

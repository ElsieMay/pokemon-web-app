import { z } from "zod";

/**
 * Schema for a favourite Pokemon
 */
export const FavouritePokemonSchema = z.object({
  id: z.number(),
  pokemon_name: z.string(),
  pokemon_id: z.number(),
  user_id: z.string().nullable(),
  created_at: z.coerce.date(),
  shakespearean_description: z.string(),
  original_description: z.string(),
});

export type FavouritePokemon = z.infer<typeof FavouritePokemonSchema>;

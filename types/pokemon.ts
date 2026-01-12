import { z } from "zod";

/**
 * Zod schema for validating Pokemon data from the API.
 *
 * @todo Add additional fields like id, url, sprites, etc.
 */
export const PokemonSchema = z.object({
  // TODO: Add additional fields
  name: z.string(),
});

export type Pokemon = z.infer<typeof PokemonSchema>;

/**
 * Validates response contains a results array of Pokemons.
 */
export const PokemonListSchema = z.object({
  results: z.array(PokemonSchema),
});

/**
 * List of Pokemons, inferred from the Zod schema.
 */
export type PokemonList = z.infer<typeof PokemonListSchema>;

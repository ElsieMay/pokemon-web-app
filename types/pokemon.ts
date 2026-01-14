import { z } from "zod";

/**
 * Schema for language reference objects from PokeAPI.
 */
export const LanguageSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export type Language = z.infer<typeof LanguageSchema>;

/**
 * Schema for version reference objects from PokeAPI.
 */
export const VersionSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export type Version = z.infer<typeof VersionSchema>;

/**
 * Schema for flavor text entry objects from PokeAPI.
 */
export const FlavorTextEntrySchema = z.object({
  flavor_text: z.string(),
  language: LanguageSchema,
  version: VersionSchema,
});

export type FlavorTextEntry = z.infer<typeof FlavorTextEntrySchema>;

/**
 * Zod schema for validating Pokemon data from the API.
 *
 * @todo Add additional fields like id, url, sprites, etc.
 */
export const PokemonSchema = z.object({
  // TODO: Add additional fields
  name: z.string(),
  flavor_text_entries: z.array(FlavorTextEntrySchema).nullable().optional(),
  id: z.number(),
});

export type Pokemon = z.infer<typeof PokemonSchema>;

/**
 * Schema for Pokemon list items (only name and url from list endpoint)
 */
export const PokemonListSchema = z.object({
  results: z.array(
    z.object({
      name: z.string(),
    })
  ),
});

/**
 * List of Pokemons, inferred from the Zod schema.
 */
export type PokemonList = z.infer<typeof PokemonListSchema>;

/**
 * Pokemon data.
 */
export interface PokemonDetails {
  name: string;
  description: string | null;
  id: number;
}

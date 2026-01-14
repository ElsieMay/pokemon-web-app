"use client";

import { useState } from "react";
import { getAllFavourites } from "@/app/actions";
import { PokemonCard } from "./PokemonCard";
import { FavouritePokemon } from "@/types/favourite";

interface FavouriteSectionProps {
  pokemons: FavouritePokemon[];
}

/**
 * Displays a list of favourite Pokemons.
 *
 * @param props - Component props
 * @returns A rendered list of favourite Pokemons with load more functionality
 *
 * @example
 * ```tsx
 * <FavouriteSection pokemons={favouritePokemons} />
 * ```
 */
export function FavouriteSection({ pokemons }: FavouriteSectionProps) {
  const [pokemonList, setPokemonList] = useState(pokemons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches favourite Pokemons and appends them to the current list.
   * Handles loading and error states.
   */
  const fetchFavouritePokemons = async () => {
    setLoading(true);

    const response = await getAllFavourites();

    if (response.success && response.data) {
      setPokemonList(response.data);
      setError(null);
    } else {
      setError("Unable to load Pokémons. Please try again.");
    }

    setLoading(false);
  };

  // Safety check for initial data
  if (!pokemonList) {
    return (
      <div className="w-full flex flex-col items-center pb-12">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          No favourite Pokémons found as yet.
        </p>
        <button
          className="btn-primary"
          onClick={() => fetchFavouritePokemons()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Show Your Favourite Pokémons"}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {error ? (
        <div className="w-full flex flex-col items-center">
          <p className="mt-4 text-red-500">{error}</p>
          <button
            className="btn-primary mt-6"
            onClick={() => fetchFavouritePokemons()}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Fetching Favourite Pokémons"}
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-7xl flex flex-col gap-6">
            {pokemonList.map((pokemon) => (
              <PokemonCard key={pokemon.pokemon_id} pokemon={pokemon} />
            ))}
          </div>
          <button
            className="btn-primary mt-6"
            onClick={() => fetchFavouritePokemons()}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : pokemonList.length > 0
              ? "Refresh"
              : "Show Your Favourite Pokémons"}
          </button>
        </div>
      )}
    </div>
  );
}

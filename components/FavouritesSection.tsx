"use client";

import { useState } from "react";
import { getAllFavourites } from "@/app/actions";
import { PokemonCard } from "./PokemonCard";
import { FavouritePokemon } from "@/types/favourite";
import { LoadingButton } from "./LoadingButton";
import { ErrorBlock } from "./ErrorBlock";

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

  const handleDeleteSuccess = (pokemonId: number) => {
    setPokemonList((prev) => prev.filter((p) => p.pokemon_id !== pokemonId));
  };

  // Safety check for initial data
  if (!pokemonList) {
    return (
      <div className="w-full flex flex-col items-center pb-12">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          No favourite Pokémons found as yet.
        </p>
        <LoadingButton
          onClick={() => fetchFavouritePokemons()}
          loading={loading}
        >
          Show Your Favourite Pokémons
        </LoadingButton>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
        Your Favourites
      </h1>
      {error ? (
        <ErrorBlock
          error={error}
          onRetry={() => fetchFavouritePokemons()}
          loading={loading}
          retryText="Retry Fetching Favourite Pokémons"
        />
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-7xl flex flex-col gap-6">
            {pokemonList.map((pokemon) => (
              <PokemonCard
                key={pokemon.pokemon_id}
                pokemon={pokemon}
                onDelete={() => handleDeleteSuccess(pokemon.pokemon_id)}
              />
            ))}
          </div>
          <LoadingButton
            className="btn-primary mt-6"
            onClick={() => fetchFavouritePokemons()}
            loading={loading}
          >
            {pokemonList.length > 0
              ? "Refresh"
              : "Show Your Favourite Pokémons"}
          </LoadingButton>
        </div>
      )}
    </div>
  );
}

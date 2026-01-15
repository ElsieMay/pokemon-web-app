"use client";

import { loadPokemons } from "@/app/actions";
import { PokemonList } from "@/types/pokemon";
import { useState } from "react";
import { LoadingButton } from "./LoadingButton";
import { ErrorBlock } from "./ErrorBlock";

interface PokemonListProps {
  initialFavourites: PokemonList;
}

/**
 * Displays a list of Pokemon with infinite scroll.
 *
 * @param props - Component props
 * @returns A rendered list of Pokemon with fetch controls
 *
 * @example
 * ```tsx
 * <PokemonList pokemons={[]} />
 * ```
 */
export function Pokemons({ initialFavourites }: PokemonListProps) {
  const [pokemonList, setPokemonList] = useState(initialFavourites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches more Pokemons and updates the list.
   * Handles loading and error states.
   */
  const fetchPokemonList = async () => {
    setLoading(true);

    const response = await loadPokemons(pokemonList?.results?.length ?? 0);

    if (response.success) {
      setPokemonList((prev) => ({
        results: [...(prev?.results ?? []), ...response.data.results],
      }));
      setError(null);
    } else {
      setError("Unable to load Pokémon. Please try again.");
    }

    setLoading(false);
  };

  // Safety check for initial data
  if (!pokemonList || !pokemonList.results) {
    return (
      <div className="w-full flex flex-col items-center pb-12">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          No Pokémon data available as yet.
        </p>
        <LoadingButton onClick={() => fetchPokemonList()} loading={loading}>
          Load Pokémon
        </LoadingButton>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {error ? (
        <ErrorBlock
          error={error}
          onRetry={() => fetchPokemonList()}
          loading={loading}
          retryText="Retry Load Pokemons"
        />
      ) : (
        <div className="w-full flex flex-col items-center">
          <ul className="mt-4 grid grid-cols-3 gap-x-8 list-disc list-inside">
            {pokemonList.results.map((pokemon) => (
              <li
                key={pokemon.name}
                className="text-slate-700 dark:text-slate-300 capitalize"
              >
                {pokemon.name}
              </li>
            ))}
          </ul>
          {!pokemonList.results.length && (
            <LoadingButton
              className="btn-primary mt-6"
              onClick={() => fetchPokemonList()}
              loading={loading}
            >
              Present Some Pokemon Names
            </LoadingButton>
          )}
        </div>
      )}
    </div>
  );
}

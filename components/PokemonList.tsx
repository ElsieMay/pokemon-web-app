"use client";

import { loadPokemons } from "@/app/actions";
import { PokemonList } from "@/types/pokemon";
import { useState } from "react";
import { LoadingButton } from "./LoadingButton";
import { ErrorBlock } from "./ErrorBlock";
import Image from "next/image";

interface PokemonListProps {
  initialFavourites?: PokemonList;
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
          No Pokémons have been loaded as yet.
        </p>
        <LoadingButton onClick={() => fetchPokemonList()} loading={loading}>
          Do you want to load some Pokémon?
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
          <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pokemonList.results.map((pokemon) => (
              <li
                key={pokemon.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                {pokemon.spriteUrl && (
                  <Image
                    src={pokemon.spriteUrl}
                    alt={pokemon.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                )}
                <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">
                  {pokemon.name}
                </span>
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

"use client";

import { loadPokemons } from "@/app/actions";
import { Pokemon } from "@/types/pokemon";
import { useState } from "react";

interface PokemonListProps {
  /** Initial list of Pokemons */
  pokemons: Pokemon[];
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
export function PokemonList({ pokemons }: PokemonListProps) {
  const [pokemonList, setPokemonList] = useState(pokemons);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches more Pokemons and updates the list.
   * Handles loading and error states.
   */
  const fetchPokemonList = async () => {
    setLoading(true);

    const response = await loadPokemons(pokemonList.length);

    if (response.success) {
      setPokemonList([...pokemonList, ...response.data]);
      setError(null);
    } else {
      setError("Error fetching Pokemons: " + response.error);
    }

    setLoading(false);
  };

  return (
    <div className="pb-12">
      {error ? (
        <div className="w-full flex flex-col items-center">
          <p className="mt-4 text-red-500">{error}</p>
          <button
            className="btn-primary mt-6"
            onClick={() => fetchPokemonList()}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Load Pokemons"}
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <ul className="mt-4 grid grid-cols-3 gap-x-8 list-disc list-inside">
            {pokemonList.map((pokemon: Pokemon) => (
              <li
                key={pokemon.name}
                className="text-slate-700 dark:text-slate-300 capitalize"
              >
                {pokemon.name}
              </li>
            ))}
          </ul>
          <button
            className="btn-primary mt-6"
            onClick={() => fetchPokemonList()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Present Some Pokemon Names"}
          </button>
        </div>
      )}
    </div>
  );
}

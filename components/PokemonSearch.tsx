"use client";

import { searchPokemonByName } from "@/app/actions";
import { useState } from "react";

interface PokemonSearchProps {
  name: string;
}

/**
 * Searches for a Pokemon by name.
 *
 * @param props - Component props
 * @returns A rendered search component
 *
 * @example
 * ```tsx
 * <PokemonSearch name="Pikachu" />
 * ```
 */
export function PokemonSearch({ name }: PokemonSearchProps) {
  const [pokemon, setPokemon] = useState(name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches a Pokemon by name and updates the state.
   * Handles loading and error states.
   */
  const fetchPokemonByName = async () => {
    setLoading(true);

    const response = await searchPokemonByName(pokemon);

    if (response.success) {
      setError(null);
    } else {
      setError(`Error fetching ${pokemon}: ` + response.error);
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="w-full max-w-sm min-w-[200px]">
        <label htmlFor="pokemon-search" className="sr-only">
          Pokemon Name
        </label>
        <input
          id="pokemon-search"
          type="text"
          value={pokemon}
          placeholder="Enter Pokemon Name"
          onChange={(e) => setPokemon(e.target.value)}
          className="w-full bg-transparent placeholder:text-slate-400 text-white text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-500 hover:border-slate-300 ring-4 ring-transparent focus:ring-slate-100"
        />
      </div>
      {error ? (
        <div className="w-full flex flex-col items-center">
          <p className="mt-4 text-red-500">{error}</p>
          <button
            className="btn-primary mt-6"
            onClick={() => fetchPokemonByName()}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Search"}
          </button>
          X
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <button
            className="btn-primary mt-6"
            onClick={() => fetchPokemonByName()}
            disabled={loading || pokemon.trim() === ""}
          >
            {loading ? "Loading..." : "Search for Pokemon"}
          </button>
        </div>
      )}
    </div>
  );
}

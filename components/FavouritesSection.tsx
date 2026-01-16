"use client";

import { useState, useEffect } from "react";
import { getAllFavourites } from "@/app/actions";
import { PokemonCard } from "./PokemonCard";
import { FavouritePokemon } from "@/types/favourite";
import { LoadingButton } from "./LoadingButton";
import { ErrorBlock } from "./ErrorBlock";

interface FavouriteSectionProps {
  initialFavourites: FavouritePokemon[];
}

// Create a global event - trigger refresh
const REFRESH_EVENT = "favourites:refresh";

/**
 * A section to display all favourite Pokémons
 * @param initialFavourites - Initial list of favourite Pokémons
 * @example
 * ```tsx
 * <FavouriteSection initialFavourites={favourites} />
 * ```
 */
export function FavouriteSection({ initialFavourites }: FavouriteSectionProps) {
  const [pokemonList, setPokemonList] = useState(initialFavourites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFavourites = async () => {
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

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => refreshFavourites();
    window.addEventListener(REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(REFRESH_EVENT, handleRefresh);
  }, []);

  const handleDeleteSuccess = (pokemonId: number) => {
    setPokemonList((prev) => prev.filter((p) => p.pokemon_id !== pokemonId));
  };

  if (!pokemonList || pokemonList.length === 0) {
    return (
      <div className="w-full flex flex-col items-center pb-12">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          No favourite Pokémons saved yet. Search and save your first one!
        </p>
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
          onRetry={refreshFavourites}
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
            onClick={refreshFavourites}
            loading={loading}
          >
            Refresh Favourites
          </LoadingButton>
        </div>
      )}
    </div>
  );
}

// Export helper to trigger refresh from anywhere
export function triggerFavouritesRefresh() {
  window.dispatchEvent(new Event("favourites:refresh"));
}

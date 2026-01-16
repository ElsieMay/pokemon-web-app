import { deleteFavouriteById } from "@/app/actions";
import { FavouritePokemon } from "@/types/favourite";
import { useState } from "react";
import { LoadingButton } from "./LoadingButton";

interface PokemonCardProps {
  /** Pokemon data from the favourites table */
  pokemon: FavouritePokemon;
  /** Callback function to trigger refresh after deletion */
  onDelete?: () => void;
}

/**
 * Displays all fields from the Pokemon (favourites) table in a styled card.
 * @param {PokemonCardProps} props - The properties for the PokemonCard component.
 * @param {FavouritePokemon} props.pokemon - The Pokemon data to display.
 * @param {Function} [props.onDelete] - Optional callback function to trigger after deletion.
 *
 * @example
 * ```tsx
 * <PokemonCard pokemon={pokemonData} />
 * ```
 */
export function PokemonCard({ pokemon, onDelete }: PokemonCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  /**
   * Handles the deletion of a favourite Pokemon.
   */
  const handleDelete = async () => {
    setLoading(true);

    const response = await deleteFavouriteById(pokemon.pokemon_id);
    if (response.success) {
      setError(null);
      setDeleted(true);
      setTimeout(() => {
        onDelete?.();
      }, 1500);
    } else {
      setError(`Unable to delete "${pokemon.pokemon_name}". Please try again.`);
    }
    setLoading(false);
  };

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-500 ${
        deleted ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
          {pokemon.pokemon_name}
        </h3>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Original Description
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-4">
          {pokemon.original_description || "No description available"}
        </p>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Shakespearean Translation
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-4 italic">
          {pokemon.shakespearean_description ||
            "No Shakespearean translation available"}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {deleted ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="text-lg">✓</span>
            <p className="text-sm font-medium">Deleted successfully!</p>
          </div>
        ) : error ? (
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <p className="mt-4 text-red-500 pb-4">{error}</p>
            <div className="flex gap-2">
              <LoadingButton
                onClick={() => handleDelete()}
                loading={loading}
                loadingText="Retrying..."
                className="btn-delete"
              >
                Retry
              </LoadingButton>
              <button
                onClick={() => setError(null)}
                disabled={loading}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            {pokemon.created_at && (
              <div>
                <span className="font-semibold">Added: </span>
                <span>{formatDate(pokemon.created_at)}</span>
              </div>
            )}
            <LoadingButton
              onClick={() => handleDelete()}
              loading={loading}
              loadingText="Deleting..."
              className="btn-delete"
            >
              Delete {pokemon.pokemon_name} from Favourites
            </LoadingButton>
          </div>
        )}
      </div>
    </div>
  );
}

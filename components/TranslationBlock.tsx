import { addToFavourites, translatePokemonDescription } from "@/app/actions";
import { FavouritePokemon } from "@/types/favourite";
import { PokemonDetails } from "@/types/pokemon";
import { useState } from "react";

interface TranslationBlockProps {
  pokemon?: PokemonDetails;
}

export function TranslationBlock({
  pokemon: pokemonDescription,
}: TranslationBlockProps) {
  // State to manage Pokemon description and translation status
  const [pokemon, setPokemonData] = useState<PokemonDetails | null>(
    pokemonDescription || null
  );
  // Store the original description to allow resetting
  const [originalDescription] = useState<string | null>(
    pokemonDescription?.description || null
  );
  const [isTranslated, setIsTranslated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);

  /**
   * Fetches Shakespearean translation for a given description.
   */
  const fetchShakespeareTranslation = async () => {
    setLoading(true);

    const response = await translatePokemonDescription(
      originalDescription || ""
    );

    if (response.success) {
      setError(null);
      setPokemonData({
        name: pokemon?.name || "",
        description: response.data,
      });
      setIsTranslated(true);
    } else {
      setError(`Error fetching translation: ` + response.error);
      setPokemonData(null);
    }

    setLoading(false);
  };

  const resetToOriginal = () => {
    setPokemonData({
      name: pokemon?.name || "",
      description: originalDescription || "",
    });
    setIsTranslated(false);
    setError(null);
  };

  const savePokemonToFavourites = async () => {
    console.log(`Saving ${pokemon?.name} to favourites.`);
    setLoadingSave(true);
    setError(null);

    const favouritePokemon: FavouritePokemon = {
      pokemon_name: pokemon?.name || "",
      //TODO: need to fetch ID from pokemon API and pass it down
      pokemon_id: 0,
      shakespearean_description: pokemon?.description || "",
      original_description: originalDescription || "",
    };

    const response = await addToFavourites(favouritePokemon);

    if (response.success) {
      setError(null);
      //TODO: Show success message to user
      console.log(`${pokemon?.name} saved to favourites successfully.`);
    } else {
      setError(`Error saving to favourites: ` + response.error);
    }

    setLoadingSave(false);
  };

  return (
    <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
      <h6 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100 capitalize">
        {pokemon?.name || "Unknown Pokemon"}
      </h6>
      <p className="text-gray-700 dark:text-gray-300">
        {pokemon?.description || "No description available."}
      </p>
      {error ? (
        <div className="w-full flex flex-col items-center">
          <p className="mt-4 text-red-500">{error}</p>
          <button
            className="btn-primary mt-6"
            onClick={() => fetchShakespeareTranslation()}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Search"}
          </button>
          X
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-2">
          {!isTranslated ? (
            <button
              className="btn-primary mt-6"
              onClick={() => fetchShakespeareTranslation()}
              disabled={loading}
            >
              {loading ? "Loading..." : "Translate to Shakespearean English"}
            </button>
          ) : (
            <div>
              <button
                className="btn-primary mt-6"
                onClick={() => resetToOriginal()}
              >
                Show Original Description
              </button>
              <h6 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100 capitalize">
                Would you like to add this Pokemon to your favourites?
              </h6>
              <button
                className="btn-primary mt-6"
                onClick={() => savePokemonToFavourites()}
              >
                {loadingSave ? "Loading..." : "Add to Favourites"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

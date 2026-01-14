import { addToFavourites, translatePokemonDescription } from "@/app/actions";
import { FavouritePokemon } from "@/types/favourite";
import { PokemonDetails } from "@/types/pokemon";
import { useState } from "react";

interface TranslationBlockProps {
  pokemon: PokemonDetails;
}

export function TranslationBlock({
  pokemon: pokemonDescription,
}: TranslationBlockProps) {
  // State to manage Pokemon description and translation status
  const [pokemon, setPokemonData] =
    useState<PokemonDetails>(pokemonDescription);
  // Store the original description to allow resetting
  const [originalDescription] = useState<string>(
    pokemonDescription.description || ""
  );
  const [isTranslated, setIsTranslated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [saved, setSaved] = useState(false);

  /**
   * Fetches Shakespearean translation for a given description.
   */
  const fetchShakespeareTranslation = async () => {
    setLoading(true);

    const response = await translatePokemonDescription(
      originalDescription || ""
    );

    if (response.success) {
      if (!response.data) {
        setError("Translation service returned an empty description.");
        setLoading(false);
        return;
      }
      setError(null);
      setPokemonData({
        ...pokemon!,
        description: response.data,
      });
      setIsTranslated(true);
    } else {
      setError(`Error fetching translation: ` + response.error);
    }

    setLoading(false);
  };

  const resetToOriginal = () => {
    setPokemonData({
      ...pokemon!,
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
      pokemon_name: pokemon!.name,
      pokemon_id: pokemon!.id,
      shakespearean_description: pokemon!.description || "",
      original_description: originalDescription || "",
    };
    const response = await addToFavourites(favouritePokemon);

    if (response.success) {
      setError(null);
      //TODO: Show success message to user
      console.log(`${pokemon?.name} saved to favourites successfully.`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(`Error saving to favourites: ` + response.error);
    }

    setLoadingSave(false);
  };

  return (
    <div className="mt-6 p-4 rounded-lg">
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
              </div>
            )}
          </div>
        )}
        {isTranslated && (
          <div className="pb-2 flex flex-col items-center">
            <h6 className="text-lg font-small mb-2 text-gray-900 dark:text-gray-100 capitalize pt-8">
              Would you like to add this Pokemon to your favourites?
            </h6>
            <button
              className={`btn-primary transition-all duration-300 ${
                saved ? "bg-green-600 scale-105" : ""
              }`}
              onClick={() => savePokemonToFavourites()}
              disabled={loadingSave}
            >
              {saved ? "✓ Saved to Favourites!" : "Add to Favourites"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

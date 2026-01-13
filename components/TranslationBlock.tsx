import { PokemonDetails } from "@/types/pokemon";

interface TranslationBlockProps {
  pokemon?: PokemonDetails;
}

export function TranslationBlock({ pokemon: pokemon }: TranslationBlockProps) {
  return (
    <div className="mt-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
      <h6 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100 capitalize">
        {pokemon?.name || "Unknown Pokemon"}
      </h6>
      <p className="text-gray-700 dark:text-gray-300">
        {pokemon?.description || "No description available."}
      </p>
    </div>
  );
}

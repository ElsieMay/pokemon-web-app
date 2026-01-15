import { FavouriteSection } from "@/components/FavouritesSection";
import { Pokemons } from "@/components/PokemonList";
import { PokemonSearch } from "@/components/PokemonSearch";
import { getAllFavourites } from "@/app/actions";

/**
 * Home page component for the Pokemon Shakespeare Web App.
 * @returns The rendered home page
 */

export default async function Home() {
  const favouritesResponse = await getAllFavourites();
  const favourites =
    favouritesResponse.success && favouritesResponse.data
      ? favouritesResponse.data
      : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 mt-20">
        Pokemon Shakespeare Web App
      </h1>
      <Pokemons pokemons={{ results: [] }} />
      <FavouriteSection pokemons={favourites} />
      <PokemonSearch />
    </main>
  );
}

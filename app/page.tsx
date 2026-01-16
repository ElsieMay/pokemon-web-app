import { Pokemons } from "@/components/PokemonList";
import { FavouriteSection } from "@/components/FavouritesSection";
import { PokemonSearch } from "@/components/PokemonSearch";
import { getOrCreateSession } from "@/lib/session";
import { getFavourites } from "@/lib/favourites";

export default async function Home() {
  const sessionId = await getOrCreateSession();
  const favourites = await getFavourites(sessionId);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 mt-20">
        Pokemon Shakespeare Web App
      </h1>
      <Pokemons />
      <FavouriteSection initialFavourites={favourites} />
      <PokemonSearch />
    </main>
  );
}

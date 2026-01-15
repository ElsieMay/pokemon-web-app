"use client";

import { FavouriteSection } from "@/components/FavouritesSection";
import { Pokemons } from "@/components/PokemonList";
import { PokemonSearch } from "@/components/PokemonSearch";
import { useEffect, useState } from "react";
import { FavouritePokemon } from "@/types/favourite";
import { getAllFavourites } from "./actions";

export default function Home() {
  const [favourites, setFavourites] = useState<FavouritePokemon[]>([]);

  const loadFavourites = async () => {
    const response = await getAllFavourites();
    if (response.success && response.data) {
      setFavourites(response.data);
    } else {
      setFavourites([]);
    }
  };

  useEffect(() => {
    loadFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSuccess = () => {
    setTimeout(() => {
      loadFavourites();
    }, 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 mt-20">
        Pokemon Shakespeare Web App
      </h1>
      <Pokemons pokemons={{ results: [] }} />
      <FavouriteSection pokemons={favourites} onRefresh={loadFavourites} />
      <PokemonSearch onSaveSuccess={handleSaveSuccess} />
    </main>
  );
}

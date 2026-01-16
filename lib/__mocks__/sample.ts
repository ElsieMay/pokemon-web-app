import type { PokemonDetails } from "@/types/pokemon";
import type { FavouritePokemon } from "@/types/favourite";

export const mockPokemonSpeciesResponse: Array<{
  name: string;
  url: string;
  spriteUrl: string;
}> = [
  {
    name: "Wormadam",
    url: "https://pokeapi.co/api/v2/pokemon-species/413/",
    spriteUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/413.png",
  },
  {
    name: "ivysaur",
    url: "https://pokeapi.co/api/v2/pokemon-species/2/",
    spriteUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png",
  },
];

export const mockAdditionalPokemonSpeciesResponse: Array<{ name: string }> = [
  {
    name: "charmander",
  },
  {
    name: "charmeleon",
  },
];

export const mockPokemonByNameResponse = {
  name: "Wormadam",
  flavor_text_entries: [
    {
      flavor_text:
        "When BURMY evolved, its cloak\n" +
        "became a part of this Pokémon’s\n" +
        "body. The cloak is never shed.",
      language: {
        name: "en",
        url: "https://pokeapi.co/api/v2/language/9/",
      },
      version: {
        name: "diamond",
        url: "",
      },
    },
  ],
  id: 2,
};

export const mockPokemonNameAndDescription: PokemonDetails = {
  name: "Pikachu",
  description: "A yellow electric mouse.",
  id: 25,
};

export const mockFavouritePokemon: FavouritePokemon = {
  id: 1,
  pokemon_name: "Pikachu",
  pokemon_id: 25,
  user_id: "user123",
  created_at: new Date(),
  shakespearean_description: "A wondrous electric mouse.",
  original_description: "A yellow mouse-like Pokémon.",
};

export const initialFavourites: FavouritePokemon[] = [
  mockFavouritePokemon,
  {
    id: 2,
    pokemon_name: "Charmander",
    pokemon_id: 4,
    user_id: "user123",
    created_at: new Date(),
    shakespearean_description: "A fiery lizard of great heat.",
    original_description: "A small, fire-type lizard Pokémon.",
  },
];

export const moreFavourites: FavouritePokemon[] = [
  {
    id: 3,
    pokemon_id: 9,
    pokemon_name: "Blastoise",
    shakespearean_description:
      "A tortoise of the deep, wielding water cannons of great power!",
    original_description:
      "A brutal Pokémon with pressurized water jets on its shell. They are used for high speed tackles.",
    user_id: "user-123",
    created_at: new Date("2024-01-03"),
  },
];

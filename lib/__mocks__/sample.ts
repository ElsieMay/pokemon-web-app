export const mockPokemonSpeciesResponse = [
  {
    name: "Wormadam",
    id: 1,
  },
  {
    name: "ivysaur",
    id: 2,
  },
];

export const mockAdditionalPokemonSpeciesResponse = [
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
        url: "https://pokeapi.co/api/v2/version/12/",
      },
    },
  ],
  id: 2,
};

export const mockPokemonNameAndDescription = {
  name: "Pikachu",
  description: "A yellow electric mouse.",
  id: 25,
};

export const mockFavouritePokemon = {
  id: 1,
  pokemon_name: "Pikachu",
  pokemon_id: 25,
  user_id: "user123",
  created_at: new Date(),
  shakespearean_description: "A wondrous electric mouse.",
  original_description: "A yellow mouse-like Pokémon.",
};

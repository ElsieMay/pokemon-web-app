import {
  mockAdditionalPokemonSpeciesResponse,
  mockFavouritePokemon,
  mockPokemonByNameResponse,
} from "@/lib/__mocks__/sample";
import {
  loadPokemons,
  searchPokemonByName,
  translatePokemonDescription,
  addToFavourites,
  getAllFavourites,
  deleteFavouriteById,
} from "../actions";
import { fetchPokemons, fetchPokemonByName } from "@/lib/pokemon";
import {
  PokemonFetchError,
  TranslationFetchError,
  FavouriteStoreError,
} from "@/types/error";
import {
  getFirstEnglishDescription,
  isRateLimited,
  rateLimitResponse,
} from "@/lib/utils";
import { fetchPokemonTranslation } from "@/lib/shakespeare";
import { getSessionId } from "@/lib/session";
import { addFavourite, getFavourites, deleteFavourite } from "@/lib/favourites";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/pokemon");
const mockFetchPokemons = fetchPokemons as jest.MockedFunction<
  typeof fetchPokemons
>;
const mockFetchPokemonByName = fetchPokemonByName as jest.MockedFunction<
  typeof fetchPokemonByName
>;

jest.mock("@/lib/shakespeare");
const mockTranslatePokemonDescription =
  fetchPokemonTranslation as jest.MockedFunction<
    typeof fetchPokemonTranslation
  >;

jest.mock("@/lib/session");
jest.mock("@/lib/favourites");
const mockGetSessionId = getSessionId as jest.MockedFunction<
  typeof getSessionId
>;
const mockAddFavourite = addFavourite as jest.MockedFunction<
  typeof addFavourite
>;
const mockGetFavourites = getFavourites as jest.MockedFunction<
  typeof getFavourites
>;
const mockDeleteFavourite = deleteFavourite as jest.MockedFunction<
  typeof deleteFavourite
>;

jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  isRateLimited: jest.fn().mockResolvedValue(false),
}));
const mockIsRateLimited = isRateLimited as jest.MockedFunction<
  typeof isRateLimited
>;

describe("Rate Limiting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test rate limiting behavior
  it("should return rate limit response when rate limited", async () => {
    mockIsRateLimited.mockResolvedValue(true);

    const response = await loadPokemons(0);

    expect(response.success).toBe(false);
    expect(mockIsRateLimited).toHaveBeenCalled();
    expect(response).toEqual(rateLimitResponse);
  });

  // Test rate limiting for all server actions
  const serverActions = [
    {
      name: "loadPokemons",
      action: () => loadPokemons(0),
    },
    {
      name: "searchPokemonByName",
      action: () => searchPokemonByName("pikachu"),
    },
    {
      name: "translatePokemonDescription",
      action: () => translatePokemonDescription("A brave Pokemon"),
    },
    {
      name: "addToFavourites",
      action: () =>
        addToFavourites({
          pokemon_name: mockFavouritePokemon.pokemon_name,
          pokemon_id: mockFavouritePokemon.pokemon_id,
          shakespearean_description:
            mockFavouritePokemon.shakespearean_description,
          original_description: mockFavouritePokemon.original_description,
        }),
    },
    {
      name: "getAllFavourites",
      action: () => getAllFavourites(),
    },
    {
      name: "deleteFavouriteById",
      action: () => deleteFavouriteById(1),
    },
  ];

  serverActions.forEach(({ name, action }) => {
    it(`should return rate limit response for ${name} when rate limited`, async () => {
      mockIsRateLimited.mockResolvedValue(true);

      const response = await action();

      expect(response.success).toBe(false);
      expect(mockIsRateLimited).toHaveBeenCalled();
      expect(response).toEqual(rateLimitResponse);
    });
  });
});

// Tests for fetching a list of Pokemons
describe("Pokemon Fetch Species List", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsRateLimited.mockResolvedValue(false);
  });

  // Test successful fetch of Pokemons List
  it("should fetch and return Pokemons successfully", async () => {
    mockFetchPokemons.mockResolvedValue(mockAdditionalPokemonSpeciesResponse);

    const response = await loadPokemons(0);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual({
        results: mockAdditionalPokemonSpeciesResponse,
      });
    }
    expect(mockFetchPokemons).toHaveBeenCalledWith(20, 0);
  });

  // Test error handling when fetch fails
  it("should handle errors when fetching Pokemons fails for PokemonFetchError", async () => {
    mockFetchPokemons.mockRejectedValue(
      new PokemonFetchError("Network Error", 404)
    );

    const response = await loadPokemons(0);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe("Network Error");
      expect(response.status).toBe(404);
    }
    expect(mockFetchPokemons).toHaveBeenCalledWith(20, 0);
  });

  // Test error handling for generic errors
  it("should handle errors when fetching Pokemons fails and not PokemonFetchError", async () => {
    mockFetchPokemons.mockRejectedValue(new Error("Network Error"));

    const response = await loadPokemons(0);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe(
        "An unknown error occurred while fetching Pokemons"
      );
      expect(response.status).toBe(500);
    }
    expect(mockFetchPokemons).toHaveBeenCalledWith(20, 0);
  });

  // Test default error message when no message is provided
  it("if error message is not available, use default error message", async () => {
    mockFetchPokemons.mockRejectedValue({});

    const response = await loadPokemons(0);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe(
        "An unknown error occurred while fetching Pokemons"
      );
      expect(response.status).toBe(500);
    }
    expect(mockFetchPokemons).toHaveBeenCalledWith(20, 0);
  });

  // Test handling of empty response
  it("should handle empty response from fetchPokemons", async () => {
    mockFetchPokemons.mockResolvedValue([]);

    const response = await loadPokemons(0);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual({ results: [] });
    }
    expect(mockFetchPokemons).toHaveBeenCalledWith(20, 0);
  });
});

// Tests for fetching a single Pokemon by name
describe("Fetch Pokemon by Name", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const pokemonName = "Wormadam";

  // Test successful fetch of a Pokemon by name
  it("should fetch and return a Pokemon by name", async () => {
    mockFetchPokemonByName.mockResolvedValue(mockPokemonByNameResponse);

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual({
        name: "Wormadam",
        description: getFirstEnglishDescription(mockPokemonByNameResponse),
        id: mockPokemonByNameResponse.id,
      });
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });

  // Test when no English description is found
  it("should return name and empty description if no English description found", async () => {
    const responseWithoutEnglishDesc = {
      ...mockPokemonByNameResponse,
      flavor_text_entries: [
        {
          flavor_text: "Ceci est une description en français.",
          language: {
            name: "fr",
            url: "https://pokeapi.co/api/v2/language/12/",
          },
          version: {
            name: "diamond",
            url: "https://pokeapi.co/api/v2/version/12/",
          },
        },
      ],
    };
    mockFetchPokemonByName.mockResolvedValue(responseWithoutEnglishDesc);

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual({
        name: "Wormadam",
        description: null,
        id: responseWithoutEnglishDesc.id,
      });
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });

  // Test when no flavor text entries are returned
  it("should return name and empty description if no entries are returned", async () => {
    const responseWithoutEnglishDesc = {
      ...mockPokemonByNameResponse,
      flavor_text_entries: [],
    };
    mockFetchPokemonByName.mockResolvedValue(responseWithoutEnglishDesc);

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual({
        name: "Wormadam",
        description: null,
        id: responseWithoutEnglishDesc.id,
      });
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });

  // Test error handling when fetch fails
  it("should handle errors when fetching a Pokemon by name fails for PokemonFetchError", async () => {
    mockFetchPokemonByName.mockRejectedValue(
      new PokemonFetchError("Not Found", 404)
    );

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe("Not Found");
      expect(response.status).toBe(404);
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });

  // Test error handling for generic errors
  it("should handle errors when fetching a Pokemon by name fails and not PokemonFetchError", async () => {
    mockFetchPokemonByName.mockRejectedValue(new Error("Server Error"));

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe(
        "An unknown error occurred while fetching the Pokemon"
      );
      expect(response.status).toBe(500);
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });

  // Test default error message when no message is provided
  it("if error message is not available, use default error message", async () => {
    mockFetchPokemonByName.mockRejectedValue({});

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe(
        "An unknown error occurred while fetching the Pokemon"
      );
      expect(response.status).toBe(500);
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });
});

describe("Translate Pokemon Description to Shakespearean", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const translatedDescription = "A valiant Pokemon.";
  const description = "A brave and strong Pokemon.";

  // Test translation of a Pokemon description - success case
  it("should call translatePokemonDescription and return translated description", async () => {
    mockTranslatePokemonDescription.mockResolvedValue(translatedDescription);

    const response = await translatePokemonDescription(description);

    expect(mockTranslatePokemonDescription).toHaveBeenCalledWith(description);
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toBe(translatedDescription);
    }
  });

  // Test translation of a Pokemon description - error case
  it("should handle errors when translating description for TranslationFetchError", async () => {
    mockTranslatePokemonDescription.mockRejectedValue(
      new TranslationFetchError("Translation Service Unavailable", 503)
    );

    const response = await translatePokemonDescription(description);

    expect(mockTranslatePokemonDescription).toHaveBeenCalledWith(description);
    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe("Translation Service Unavailable");
      expect(response.status).toBe(503);
    }
  });

  // Test translation of a Pokemon description - generic error case
  it("should handle errors when translating description fails and not TranslationFetchError", async () => {
    mockTranslatePokemonDescription.mockRejectedValue(
      new Error("Service Error")
    );

    const response = await translatePokemonDescription(description);

    expect(mockTranslatePokemonDescription).toHaveBeenCalledWith(description);
    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe(
        "An unknown error occurred while translating the description"
      );
      expect(response.status).toBe(500);
    }
  });

  // Test default error message when no message is provided
  it("if error message is not available, use default error message", async () => {
    mockTranslatePokemonDescription.mockRejectedValue({});

    const response = await translatePokemonDescription(description);

    expect(mockTranslatePokemonDescription).toHaveBeenCalledWith(description);
    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe(
        "An unknown error occurred while translating the description"
      );
      expect(response.status).toBe(500);
    }
  });
});

describe("add to favourites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSessionId = "user-123";

  // Test adding a Pokemon to favourites - success case
  it("should add a Pokemon to favourites successfully", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockAddFavourite.mockResolvedValue(mockFavouritePokemon);

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    const response = await addToFavourites({
      pokemon_name: mockFavouritePokemon.pokemon_name,
      pokemon_id: mockFavouritePokemon.pokemon_id,
      shakespearean_description: mockFavouritePokemon.shakespearean_description,
      original_description: mockFavouritePokemon.original_description,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).toHaveBeenCalledWith(
      mockFavouritePokemon.pokemon_name,
      mockFavouritePokemon.pokemon_id,
      mockFavouritePokemon.shakespearean_description,
      mockFavouritePokemon.original_description,
      mockSessionId
    );
    expect(response).toEqual({ data: mockFavouritePokemon, success: true });
  });

  // Test should handle when session ID is not available
  it("should throw an error when session ID is not available", async () => {
    mockGetSessionId.mockRejectedValue(mockSessionId);

    await expect(
      addToFavourites({
        pokemon_name: mockFavouritePokemon.pokemon_name,
        pokemon_id: mockFavouritePokemon.pokemon_id,
        shakespearean_description:
          mockFavouritePokemon.shakespearean_description,
        original_description: mockFavouritePokemon.original_description,
      })
    ).resolves.toEqual({
      success: false,
      error: "An unknown error occurred while adding to favourites",
      status: 500,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).not.toHaveBeenCalled();
  });

  // Test adding a Pokemon to favourites - failure case
  it("should handle errors when adding a Pokemon to favourites fails", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockAddFavourite.mockRejectedValue(
      new FavouriteStoreError("Database Error", 500)
    );

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    await expect(
      addToFavourites({
        pokemon_name: mockFavouritePokemon.pokemon_name,
        pokemon_id: mockFavouritePokemon.pokemon_id,
        shakespearean_description:
          mockFavouritePokemon.shakespearean_description,
        original_description: mockFavouritePokemon.original_description,
      })
    ).resolves.toEqual({
      success: false,
      error: "Database Error",
      status: 500,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).toHaveBeenCalledWith(
      mockFavouritePokemon.pokemon_name,
      mockFavouritePokemon.pokemon_id,
      mockFavouritePokemon.shakespearean_description,
      mockFavouritePokemon.original_description,
      mockSessionId
    );
  });

  // Test error handling for generic errors
  it("should handle errors when adding a Pokemon to favourites fails and not FavouriteStoreError", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockAddFavourite.mockRejectedValue(new Error("Service Error"));

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    await expect(
      addToFavourites({
        pokemon_name: mockFavouritePokemon.pokemon_name,
        pokemon_id: mockFavouritePokemon.pokemon_id,
        shakespearean_description:
          mockFavouritePokemon.shakespearean_description,
        original_description: mockFavouritePokemon.original_description,
      })
    ).resolves.toEqual({
      success: false,
      error: "An unknown error occurred while adding to favourites",
      status: 500,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).toHaveBeenCalledWith(
      mockFavouritePokemon.pokemon_name,
      mockFavouritePokemon.pokemon_id,
      mockFavouritePokemon.shakespearean_description,
      mockFavouritePokemon.original_description,
      mockSessionId
    );
  });

  // Test duplicate Pokemon handling
  it("should return conflict error when trying to add duplicate Pokemon", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockAddFavourite.mockRejectedValue(
      new Error(
        'duplicate key value violates unique constraint "favourites_pokemon_id_user_id_key"'
      )
    );

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    const response = await addToFavourites({
      pokemon_name: mockFavouritePokemon.pokemon_name,
      pokemon_id: mockFavouritePokemon.pokemon_id,
      shakespearean_description: mockFavouritePokemon.shakespearean_description,
      original_description: mockFavouritePokemon.original_description,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).toHaveBeenCalledWith(
      mockFavouritePokemon.pokemon_name,
      mockFavouritePokemon.pokemon_id,
      mockFavouritePokemon.shakespearean_description,
      mockFavouritePokemon.original_description,
      mockSessionId
    );
    expect(response).toEqual({
      success: false,
      error: "This Pokémon is already in your favourites",
      status: 409,
    });
  });
});

describe("getAllFavourites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSessionId = "user-123";

  // Test fetching all favourite Pokemons - success case
  it("should fetch all favourite Pokemons successfully", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockAddFavourite.mockResolvedValue(mockFavouritePokemon);

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    const response = await getAllFavourites();

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).not.toHaveBeenCalled();
    expect(response.success).toBe(true);
  });

  // Test should handle when session ID is not available
  it("should throw an error when session ID is not available", async () => {
    mockGetSessionId.mockRejectedValue(mockSessionId);

    await expect(getAllFavourites()).resolves.toEqual({
      success: false,
      error: "An unknown error occurred while fetching favourites",
      status: 500,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockAddFavourite).not.toHaveBeenCalled();
  });

  // Test adding a Pokemon to favourites - failure case
  it("should handle errors when fetching all favourite Pokemons fails", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockGetFavourites.mockRejectedValue(
      new FavouriteStoreError("Database Error", 500)
    );

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    await expect(getAllFavourites()).resolves.toEqual({
      success: false,
      error: "Database Error",
      status: 500,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockGetFavourites).toHaveBeenCalledWith(mockSessionId);
  });

  // Test for delete favourite - success case
  it("should delete a favourite Pokemon successfully", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockDeleteFavourite.mockResolvedValue();

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    const response = await deleteFavouriteById(1);

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockDeleteFavourite).toHaveBeenCalledWith(1, mockSessionId);
    expect(response).toEqual({ data: null, success: true });
  });

  // Test for delete favourite - failure case
  it("should handle errors when deleting a favourite Pokemon fails", async () => {
    mockGetSessionId.mockResolvedValue(mockSessionId);
    mockDeleteFavourite.mockRejectedValue(
      new FavouriteStoreError("Database Error", 500)
    );

    const sessionId = await getSessionId();
    expect(sessionId).toBe(mockSessionId);

    await expect(deleteFavouriteById(1)).resolves.toEqual({
      success: false,
      error: "Database Error",
      status: 500,
    });

    expect(mockGetSessionId).toHaveBeenCalled();
    expect(mockDeleteFavourite).toHaveBeenCalledWith(1, mockSessionId);
  });
});

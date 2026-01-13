import {
  mockAdditionalPokemonSpeciesResponse,
  mockPokemonByNameResponse,
} from "@/lib/__mocks__/sample";
import { loadPokemons, searchPokemonByName } from "../actions";
import { fetchPokemons, fetchPokemonByName } from "@/lib/pokemon";
import { PokemonFetchError } from "@/types/error";
import { getFirstEnglishDescription } from "@/lib/utils";

jest.mock("@/lib/pokemon");
const mockFetchPokemons = fetchPokemons as jest.MockedFunction<
  typeof fetchPokemons
>;
const mockFetchPokemonByName = fetchPokemonByName as jest.MockedFunction<
  typeof fetchPokemonByName
>;

// Tests for fetching a list of Pokemons
describe("Pokemon Fetch Species List", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test successful fetch of Pokemons List
  it("should fetch and return Pokemons successfully", async () => {
    mockFetchPokemons.mockResolvedValue(mockAdditionalPokemonSpeciesResponse);

    const response = await loadPokemons(0);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(mockAdditionalPokemonSpeciesResponse);
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
      expect(response.error).toBe("Network Error");
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
      expect(response.data).toEqual([]);
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
      expect(response.error).toBe("Server Error");
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

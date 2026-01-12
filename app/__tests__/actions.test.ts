import {
  mockAdditionalPokemonSpeciesResponse,
  mockPokemonSpeciesResponse,
} from "@/lib/__mocks__/sample";
import { loadPokemons, searchPokemonByName } from "../actions";
import { fetchPokemons, fetchPokemonByName } from "@/lib/pokemon";
import { PokemonFetchError } from "@/types/error";

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

  it("should fetch and return Pokemons successfully", async () => {
    mockFetchPokemons.mockResolvedValue(mockAdditionalPokemonSpeciesResponse);

    const response = await loadPokemons(0);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(mockAdditionalPokemonSpeciesResponse);
    }
    expect(mockFetchPokemons).toHaveBeenCalledWith(20, 0);
  });

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

  it("should fetch and return a Pokemon by name", async () => {
    const mockResponse = mockPokemonSpeciesResponse[0];
    mockFetchPokemonByName.mockResolvedValue(mockResponse);

    const response = await searchPokemonByName(pokemonName);

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data).toEqual(mockResponse);
    }
    expect(mockFetchPokemonByName).toHaveBeenCalledWith(pokemonName);
  });

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

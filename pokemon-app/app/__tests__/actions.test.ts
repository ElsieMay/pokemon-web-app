import { mockAdditionalPokemonSpeciesResponse } from "@/lib/__mocks__/sample";
import { loadPokemons } from "../actions";
import { fetchPokemons } from "@/lib/pokemon";
import { PokemonFetchError } from "@/types/error";

jest.mock("@/lib/pokemon");
const mockFetchPokemons = fetchPokemons as jest.MockedFunction<
  typeof fetchPokemons
>;

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

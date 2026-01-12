import { fetchPokemons, fetchPokemonByName } from "../pokemon";
import { API_BASE_URL, CACHE_REVALIDATE_TIME } from "../config";
import { mockPokemonSpeciesResponse } from "../__mocks__/sample";
import { PokemonFetchError } from "@/types/error";

global.fetch = jest.fn();

describe("fetchPokemons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and return a list of Pokemons successfully", async () => {
    const mockResponse = {
      results: mockPokemonSpeciesResponse,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchPokemons(2, 0);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species?limit=2&offset=0`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
    expect(result).toEqual(mockResponse.results);
  });

  it("should PokemonFetchError throw an error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchPokemons(2, 0)).rejects.toThrow(PokemonFetchError);
    await expect(fetchPokemons(2, 0)).rejects.toMatchObject({
      name: "PokemonFetchError",
      message: "Failed to fetch Pokemons: Not Found",
      status: 404,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species?limit=2&offset=0`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
  });

  it("should throw PokemonFetchError when an error occurs", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    let thrownError;
    try {
      await fetchPokemons(2, 0);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(PokemonFetchError);
    expect(thrownError).toMatchObject({
      message: "Network Error",
      status: 500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species?limit=2&offset=0`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should throw PokemonFetchError with unknown error message when a non-Error is thrown", async () => {
    (global.fetch as jest.Mock).mockRejectedValue({});

    await expect(fetchPokemons(2, 0)).rejects.toThrow(PokemonFetchError);
    await expect(fetchPokemons(2, 0)).rejects.toMatchObject({
      message: "An unknown error occurred",
      status: 500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species?limit=2&offset=0`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
  });

  const invalidResponses = [
    {
      results: "not-an-array",
    },
    {
      data: mockPokemonSpeciesResponse,
    },
    {
      results: [{ name: 123 }],
    },
  ];

  invalidResponses.forEach((invalid) => {
    it(`should throw PokemonFetchError when response has invalid structure: ${JSON.stringify(
      invalid
    )}`, async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => invalid,
      });

      await expect(fetchPokemons(2, 0)).rejects.toThrow(PokemonFetchError);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/pokemon-species?limit=2&offset=0`,
        expect.objectContaining({
          next: { revalidate: CACHE_REVALIDATE_TIME },
        })
      );
    });
  });
});

describe("fetch Pokemon by name", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const pokemonName = "Wormadam";

  it("should fetch a single Pokemon by name successfully", async () => {
    const mockResponse = mockPokemonSpeciesResponse[0];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchPokemonByName(
      mockPokemonSpeciesResponse[0]?.name.toString() || ""
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species/${mockPokemonSpeciesResponse[0]?.name}`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw PokemonFetchError when pokemon is not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchPokemonByName("unknown-pokemon")).rejects.toThrow(
      PokemonFetchError
    );
    await expect(fetchPokemonByName("unknown-pokemon")).rejects.toMatchObject({
      name: "PokemonFetchError",
      message: "Failed to fetch unknown-pokemon, error: Not Found",
      status: 404,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species/unknown-pokemon`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
  });

  it("should throw PokemonFetchError when an error occurs", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    let thrownError;
    try {
      await fetchPokemonByName(pokemonName);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(PokemonFetchError);
    expect(thrownError).toMatchObject({
      message: "Network Error",
      status: 500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species/${pokemonName}`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should throw PokemonFetchError with unknown error message when a non-Error is thrown", async () => {
    (global.fetch as jest.Mock).mockRejectedValue({});

    await expect(fetchPokemonByName(pokemonName)).rejects.toThrow(
      PokemonFetchError
    );
    await expect(fetchPokemonByName(pokemonName)).rejects.toMatchObject({
      message: "An unknown error occurred",
      status: 500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/pokemon-species/${pokemonName}`,
      expect.objectContaining({
        next: { revalidate: CACHE_REVALIDATE_TIME },
      })
    );
  });
});

import {
  API_SHAKESPEARE_TRANSLATION_URL,
  CACHE_REVALIDATE_TIME,
} from "../config";
import { fetchPokemonTranslation } from "../shakespeare";
import { TranslationFetchError } from "@/types/error";

global.fetch = jest.fn();

const getExpectedFetchConfig = (text: string) =>
  expect.objectContaining({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
    next: { revalidate: CACHE_REVALIDATE_TIME },
  });

describe("fetch Shakespeare translation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const pokemonDescription = "A brave Pokemon.";
  const translatedDescription = "A valiant Pokemon.";

  // Test for fetching Shakespeare translation - success case
  it("should fetch Shakespeare translation successfully", async () => {
    const mockResponse = {
      contents: {
        translated: translatedDescription,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchPokemonTranslation(pokemonDescription);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_SHAKESPEARE_TRANSLATION_URL}`,
      getExpectedFetchConfig(pokemonDescription)
    );
    expect(result).toEqual(translatedDescription);
  });

  // Test for fetching Shakespeare translation - failure case
  it("should handle fetch failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
      status: 500,
    });

    await expect(fetchPokemonTranslation(pokemonDescription)).rejects.toThrow(
      new TranslationFetchError(
        `Failed to translate description: Internal Server Error`,
        500
      )
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_SHAKESPEARE_TRANSLATION_URL}`,
      getExpectedFetchConfig(pokemonDescription)
    );
  });

  // Test for fetching Shakespeare translation - non-Error thrown
  it("should throw TranslationFetchError when an error occurs", async () => {
    (global.fetch as jest.Mock).mockRejectedValue({});

    let thrownError;
    try {
      await fetchPokemonTranslation(pokemonDescription);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(TranslationFetchError);
    expect(thrownError).toMatchObject({
      message: "An unknown error occurred",
      status: 500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_SHAKESPEARE_TRANSLATION_URL}`,
      getExpectedFetchConfig(pokemonDescription)
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // Test case for fetching Shakespeare translation - error during fetch
  it("should throw TranslationFetchError when an Error is thrown", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network connectivity issue")
    );

    let thrownError;
    try {
      await fetchPokemonTranslation(pokemonDescription);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeInstanceOf(TranslationFetchError);
    expect(thrownError).toMatchObject({
      message: "Network connectivity issue",
      status: 500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_SHAKESPEARE_TRANSLATION_URL}`,
      getExpectedFetchConfig(pokemonDescription)
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

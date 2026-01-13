import { mockFavouritePokemon } from "../__mocks__/sample";
import { addFavourite } from "../favourites";
import { query } from "../db";

jest.mock("../db");

const mockQuery = query as jest.MockedFunction<typeof query>;

describe("Favourites Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for adding a favourite Pokemon - success case
  it("should add a favourite Pokemon successfully", async () => {
    mockQuery.mockResolvedValue([mockFavouritePokemon]);

    const result = await addFavourite(
      mockFavouritePokemon.pokemon_name,
      mockFavouritePokemon.pokemon_id,
      mockFavouritePokemon.shakespearean_description,
      mockFavouritePokemon.original_description,
      mockFavouritePokemon.user_id || undefined
    );

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO favourites"),
      [
        mockFavouritePokemon.pokemon_name,
        mockFavouritePokemon.pokemon_id,
        mockFavouritePokemon.user_id,
        mockFavouritePokemon.shakespearean_description,
        mockFavouritePokemon.original_description || null,
      ]
    );

    expect(result).toEqual(mockFavouritePokemon);
  });

  // Test for adding a favourite Pokemon - failure case
  it("should throw an error when failing to add a favourite Pokemon", async () => {
    mockQuery.mockResolvedValue([]);
    await expect(
      addFavourite(
        mockFavouritePokemon.pokemon_name,
        mockFavouritePokemon.pokemon_id,
        mockFavouritePokemon.shakespearean_description,
        mockFavouritePokemon.original_description,
        undefined
      )
    ).rejects.toThrow("Failed to add favourite");
  });
});

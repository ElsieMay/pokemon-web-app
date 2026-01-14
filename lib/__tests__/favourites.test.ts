import { mockFavouritePokemon } from "../__mocks__/sample";
import { addFavourite, getFavourites } from "../favourites";
import { query } from "../db";
import { validateUserId } from "../utils";

jest.mock("../db");
const mockQuery = query as jest.MockedFunction<typeof query>;

//mock validation helpers
jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  validateUserId: jest.fn(),
  validatePokemonName: jest.fn((name) => name),
  validateDescription: jest.fn((desc) => desc),
}));
const mockIsUserIdValid = validateUserId as jest.MockedFunction<
  typeof validateUserId
>;

describe("Favourites Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsUserIdValid.mockReturnValue(undefined); // Default to valid user ID
  });

  // Test for adding a favourite Pokemon - success case
  it("should add a favourite Pokemon successfully", async () => {
    mockIsUserIdValid.mockReturnValue();
    mockQuery.mockResolvedValue([mockFavouritePokemon]);

    const result = await addFavourite(
      mockFavouritePokemon.pokemon_name,
      mockFavouritePokemon.pokemon_id,
      mockFavouritePokemon.shakespearean_description,
      mockFavouritePokemon.original_description,
      mockFavouritePokemon.user_id
    );

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO favourites"),
      [
        mockFavouritePokemon.pokemon_name,
        mockFavouritePokemon.pokemon_id,
        mockFavouritePokemon.user_id,
        mockFavouritePokemon.shakespearean_description,
        mockFavouritePokemon.original_description,
      ]
    );

    expect(result).toEqual(mockFavouritePokemon);
  });

  // Test for adding a favourite Pokemon - failure case
  it("should throw an error when failing to add a favourite Pokemon", async () => {
    mockIsUserIdValid.mockReturnValue();
    mockQuery.mockResolvedValue([]);
    await expect(
      addFavourite(
        mockFavouritePokemon.pokemon_name,
        mockFavouritePokemon.pokemon_id,
        mockFavouritePokemon.shakespearean_description,
        mockFavouritePokemon.original_description,
        mockFavouritePokemon.user_id
      )
    ).rejects.toThrow("Failed to add favourite");
  });

  // Test for invalid user ID
  it("should throw an error for invalid user ID", async () => {
    mockIsUserIdValid.mockImplementation(() => {
      throw new Error("Invalid user ID format");
    });

    await expect(
      addFavourite(
        mockFavouritePokemon.pokemon_name,
        mockFavouritePokemon.pokemon_id,
        mockFavouritePokemon.shakespearean_description,
        mockFavouritePokemon.original_description,
        "invalid-uuid"
      )
    ).rejects.toThrow("Invalid user ID format");
  });

  // Test for get favourites query
  it("should get favourites for a user", async () => {
    mockIsUserIdValid.mockReturnValue();
    mockQuery.mockResolvedValue([mockFavouritePokemon]);

    const result = await getFavourites(mockFavouritePokemon.user_id);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT pokemon_name, created_at"),
      [mockFavouritePokemon.user_id || null]
    );

    expect(result).toEqual([mockFavouritePokemon]);
  });

  // Test for get favourites with invalid user ID
  it("should throw an error for invalid user ID when getting favourites", async () => {
    mockIsUserIdValid.mockImplementation(() => {
      throw new Error("Invalid user ID format");
    });

    await expect(getFavourites("invalid-uuid")).rejects.toThrow(
      "Invalid user ID format"
    );
  });
});

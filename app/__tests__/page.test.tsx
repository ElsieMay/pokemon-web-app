import Home from "../page";
import { fetchFavouritesForSession } from "@/lib/favourites";
import { moreFavourites } from "@/lib/__mocks__/sample";

jest.mock("@/lib/favourites");
const mockFetchFavouritesForSession =
  fetchFavouritesForSession as jest.MockedFunction<
    typeof fetchFavouritesForSession
  >;

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays favourite pokemons", async () => {
    mockFetchFavouritesForSession.mockResolvedValueOnce(moreFavourites);

    const home = await Home();

    expect(home).toBeDefined();
    expect(mockFetchFavouritesForSession).toHaveBeenCalled();
  });

  it("handles empty favourite pokemons", async () => {
    mockFetchFavouritesForSession.mockResolvedValueOnce([]);

    const home = await Home();

    expect(home).toBeDefined();
    expect(mockFetchFavouritesForSession).toHaveBeenCalled();
  });
});

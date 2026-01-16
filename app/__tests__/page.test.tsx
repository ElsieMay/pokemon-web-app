import Home from "../page";
import { moreFavourites } from "@/lib/__mocks__/sample";
import { getOrCreateSession } from "@/lib/session";
import { getFavourites } from "@/lib/favourites";

jest.mock("@/lib/favourites");
const mockFetchFavouritesForSession = getFavourites as jest.MockedFunction<
  typeof getFavourites
>;

jest.mock("@/lib/session");
const mockGetOrCreateSession = getOrCreateSession as jest.MockedFunction<
  typeof getOrCreateSession
>;

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays favourite pokemons", async () => {
    mockGetOrCreateSession.mockResolvedValueOnce("test-session-id");
    mockFetchFavouritesForSession.mockResolvedValueOnce(moreFavourites);

    const home = await Home();

    expect(home).toBeDefined();
    expect(mockFetchFavouritesForSession).toHaveBeenCalled();
  });

  it("handles empty favourite pokemons", async () => {
    mockGetOrCreateSession.mockResolvedValueOnce("test-session-id");
    mockFetchFavouritesForSession.mockResolvedValueOnce([]);

    const home = await Home();

    expect(home).toBeDefined();
    expect(mockFetchFavouritesForSession).toHaveBeenCalled();
  });
});

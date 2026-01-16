import Home from "../page";
import { moreFavourites } from "@/lib/__mocks__/sample";
import { getExistingSession } from "@/lib/session";
import { getFavourites } from "@/lib/favourites";

jest.mock("@/lib/favourites");
const mockFetchFavouritesForSession = getFavourites as jest.MockedFunction<
  typeof getFavourites
>;

jest.mock("@/lib/session");
const mockgetExistingSession = getExistingSession as jest.MockedFunction<
  typeof getExistingSession
>;

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays favourite pokemons", async () => {
    mockgetExistingSession.mockResolvedValueOnce("test-session-id");
    mockFetchFavouritesForSession.mockResolvedValueOnce(moreFavourites);

    const home = await Home();

    expect(home).toBeDefined();
    expect(mockFetchFavouritesForSession).toHaveBeenCalledWith(
      "test-session-id"
    );
  });

  it("handles no existing session", async () => {
    mockgetExistingSession.mockResolvedValueOnce(null);

    const home = await Home();

    expect(home).toBeDefined();
    expect(mockFetchFavouritesForSession).not.toHaveBeenCalled();
  });
});

import { getAllFavourites } from "@/app/actions";
import { moreFavourites } from "@/lib/__mocks__/sample";
import Home from "../page";

jest.mock("@/app/actions");
const mockGetAllFavourites = getAllFavourites as jest.MockedFunction<
  typeof getAllFavourites
>;

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the home page with favourites", async () => {
    mockGetAllFavourites.mockResolvedValue({
      success: true,
      data: moreFavourites,
    });

    const homePage = await Home();
    expect(homePage).toBeDefined();
    expect(mockGetAllFavourites).toHaveBeenCalledTimes(1);
  });

  it("should render the home page with no favourites", async () => {
    mockGetAllFavourites.mockResolvedValue({
      success: true,
      data: [],
    });

    const homePage = await Home();
    expect(homePage).toBeDefined();
    expect(mockGetAllFavourites).toHaveBeenCalledTimes(1);
  });

  it("should render the home page with empty favourites when API fails", async () => {
    mockGetAllFavourites.mockResolvedValue({
      success: false,
      error: "Failed to fetch favourites",
      status: 500,
    });

    const homePage = await Home();
    expect(homePage).toBeDefined();
    expect(mockGetAllFavourites).toHaveBeenCalledTimes(1);
  });
});

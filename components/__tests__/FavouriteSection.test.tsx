import { getAllFavourites } from "@/app/actions";
import { initialFavourites } from "@/lib/__mocks__/sample";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { FavouriteSection } from "../FavouritesSection";

jest.mock("@/app/actions");
const mockGetFavourites = getAllFavourites as jest.MockedFunction<
  typeof getAllFavourites
>;

describe("FavouriteSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Safety check tests
  describe("Safety checks for missing data", () => {
    it("should render fallback UI when pokemonList is null", () => {
      // @ts-expect-error - Testing null safety check
      render(<FavouriteSection pokemons={null} />);

      expect(
        screen.getByText("No favourite Pokémons found as yet.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Show Your Favourite Pokémons/i })
      ).toBeInTheDocument();
    });

    it("should allow fetching Pokemons from fallback state", async () => {
      mockGetFavourites.mockResolvedValueOnce({
        success: true,
        data: initialFavourites,
      });

      // @ts-expect-error - Testing null safety check
      render(<FavouriteSection pokemons={null} />);

      const loadButton = screen.getByRole("button", {
        name: /Show Your Favourite Pokémons/i,
      });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(getAllFavourites).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText("Pikachu")).toBeInTheDocument();
        expect(screen.getByText("Charmander")).toBeInTheDocument();
      });
    });
  });
});

// Functional tests
it("should render favourite Pokémons and load more on button click", async () => {
  mockGetFavourites.mockResolvedValueOnce({
    success: true,
    data: initialFavourites,
  });

  const { getByText, getByRole } = render(<FavouriteSection pokemons={[]} />);

  const loadButton = getByRole("button", {
    name: /Show Your Favourite Pokémons/i,
  });
  fireEvent.click(loadButton);

  await waitFor(() => {
    expect(mockGetFavourites).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(getByText("Pikachu")).toBeInTheDocument();
    expect(getByText("Charmander")).toBeInTheDocument();
  });
});

// Error handling tests
it("should handle errors when fetching favourite Pokémons", async () => {
  mockGetFavourites.mockResolvedValueOnce({
    success: false,
    error: "Unable to load Pokémons. Please try again.",
    status: 500,
  });

  const { getByText, getByRole } = render(<FavouriteSection pokemons={[]} />);

  const loadButton = getByRole("button", {
    name: /Show Your Favourite Pokémons/i,
  });
  fireEvent.click(loadButton);

  await waitFor(() => {
    expect(mockGetFavourites).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(
      getByText("Unable to load Pokémons. Please try again.")
    ).toBeInTheDocument();
  });
});

it("should retry fetching favourite Pokémons after error", async () => {
  mockGetFavourites.mockResolvedValueOnce({
    success: false,
    error: "Unable to load Pokémons. Please try again.",
    status: 500,
  });

  const { getByText, getByRole } = render(<FavouriteSection pokemons={[]} />);

  const loadButton = getByRole("button", {
    name: /Show Your Favourite Pokémons/i,
  });
  fireEvent.click(loadButton);

  await waitFor(() => {
    expect(
      getByText("Unable to load Pokémons. Please try again.")
    ).toBeInTheDocument();
  });

  mockGetFavourites.mockResolvedValueOnce({
    success: true,
    data: initialFavourites,
  });

  const retryButton = getByRole("button", {
    name: /Retry Fetching Favourite Pokémons/i,
  });
  fireEvent.click(retryButton);

  await waitFor(() => {
    expect(mockGetFavourites).toHaveBeenCalledTimes(2);
  });

  await waitFor(() => {
    expect(getByText("Pikachu")).toBeInTheDocument();
    expect(getByText("Charmander")).toBeInTheDocument();
  });
});

it("should show 'Refresh' button text when favourites list has items", async () => {
  const { getByRole } = render(
    <FavouriteSection pokemons={initialFavourites} />
  );

  const refreshButton = getByRole("button", {
    name: /Refresh/i,
  });

  expect(refreshButton).toBeInTheDocument();
});

import { getAllFavourites, deleteFavouriteById } from "@/app/actions";
import { initialFavourites, moreFavourites } from "@/lib/__mocks__/sample";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import {
  FavouriteSection,
  triggerFavouritesRefresh,
} from "../FavouritesSection";

jest.mock("@/app/actions");
const mockGetFavourites = getAllFavourites as jest.MockedFunction<
  typeof getAllFavourites
>;
const mockDeleteFavourite = deleteFavouriteById as jest.MockedFunction<
  typeof deleteFavouriteById
>;

describe("FavouriteSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows message when no favourites", () => {
    render(<FavouriteSection initialFavourites={[]} />);
    expect(
      screen.getByText(
        "No favourite Pokémons saved yet. Search and save your first one!"
      )
    ).toBeInTheDocument();
  });

  it("handles delete favourite", async () => {
    mockDeleteFavourite.mockResolvedValueOnce({ success: true, data: null });

    render(<FavouriteSection initialFavourites={initialFavourites} />);

    const firstPokemon = initialFavourites[0];

    const deleteButton = screen.getByText(
      `Delete ${firstPokemon?.pokemon_name} from Favourites`
    );

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockDeleteFavourite).toHaveBeenCalledWith(
        firstPokemon?.pokemon_id
      );
    });

    await waitFor(
      () => {
        expect(
          screen.queryByText(firstPokemon?.pokemon_name ?? "")
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("handles if refresh favourites fails", async () => {
    mockGetFavourites.mockResolvedValueOnce({
      success: false,
      error: "Failed to fetch favourites",
      status: 500,
    });

    render(<FavouriteSection initialFavourites={initialFavourites} />);

    await act(async () => {
      fireEvent(window, new Event("favourites:refresh"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load Pokémons. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("retries after failed refresh", async () => {
    mockGetFavourites
      .mockResolvedValueOnce({
        success: false,
        error: "Failed to fetch favourites",
        status: 500,
      })
      .mockResolvedValueOnce({
        success: true,
        data: moreFavourites,
      });

    render(<FavouriteSection initialFavourites={initialFavourites} />);

    await act(async () => {
      fireEvent(window, new Event("favourites:refresh"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load Pokémons. Please try again.")
      ).toBeInTheDocument();
    });

    // Click retry button
    await act(async () => {
      fireEvent.click(screen.getByText("Retry Fetching Favourite Pokémons"));
    });

    await waitFor(() => {
      expect(screen.getByText("Blastoise")).toBeInTheDocument();
      expect(screen.queryByText("Pikachu")).not.toBeInTheDocument();
    });
  });

  it("triggers refresh using helper function", async () => {
    mockGetFavourites.mockResolvedValueOnce({
      success: true,
      data: moreFavourites,
    });

    render(<FavouriteSection initialFavourites={initialFavourites} />);

    await act(async () => {
      triggerFavouritesRefresh();
    });

    await waitFor(() => {
      expect(screen.getByText("Blastoise")).toBeInTheDocument();
    });
  });
});

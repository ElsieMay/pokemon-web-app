import React from "react";
import { getAllFavourites } from "@/app/actions";
import { moreFavourites } from "@/lib/__mocks__/sample";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../page";

jest.mock("@/app/actions");
const mockGetAllFavourites = getAllFavourites as jest.MockedFunction<
  typeof getAllFavourites
>;

jest.mock("@/components/PokemonSearch", () => ({
  PokemonSearch: ({ onSaveSuccess }: { onSaveSuccess?: () => void }) => (
    <div>
      <button
        data-testid="trigger-save-success"
        onClick={() => onSaveSuccess?.()}
      >
        Trigger Save
      </button>
    </div>
  ),
}));

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays favourite pokemons", async () => {
    mockGetAllFavourites.mockResolvedValueOnce({
      success: true,
      data: moreFavourites,
    });

    const { getByText } = render(<Home />);

    await waitFor(() => {
      expect(getByText("Pokemon Shakespeare Web App")).toBeInTheDocument();
      moreFavourites.forEach((fav) => {
        expect(getByText(fav.pokemon_name)).toBeInTheDocument();
      });
    });
  });

  it("handles failure to load favourites gracefully and set favourites to null", async () => {
    mockGetAllFavourites.mockResolvedValueOnce({
      success: false,
      error: "Failed to load favourites",
      status: 500,
    });

    const { getByText, queryByText } = render(<Home />);

    await waitFor(() => {
      expect(getByText("Pokemon Shakespeare Web App")).toBeInTheDocument();
      moreFavourites.forEach((fav) => {
        expect(queryByText(fav.pokemon_name)).not.toBeInTheDocument();
      });
    });
  });

  it("should handle if no favourites are returned", async () => {
    mockGetAllFavourites.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    const { getByText, queryByText } = render(<Home />);

    await waitFor(() => {
      expect(getByText("Pokemon Shakespeare Web App")).toBeInTheDocument();
      moreFavourites.forEach((fav) => {
        expect(queryByText(fav.pokemon_name)).not.toBeInTheDocument();
      });
    });
  });

  it("calls loadFavourites after 2 seconds when a pokemon is saved", async () => {
    jest.useFakeTimers();

    // Initial load
    mockGetAllFavourites.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    const { getByTestId } = render(<Home />);

    await waitFor(() => {
      expect(mockGetAllFavourites).toHaveBeenCalledTimes(1);
    });

    mockGetAllFavourites.mockResolvedValueOnce({
      success: true,
      data: moreFavourites,
    });

    // Trigger the save success callback
    const triggerButton = getByTestId("trigger-save-success");
    triggerButton.click();

    // Fast-forward time by 2 seconds - to simulate the setTimeout
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockGetAllFavourites).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });
});

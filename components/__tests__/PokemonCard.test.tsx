import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonCard } from "../PokemonCard";
import { FavouritePokemon } from "@/types/favourite";
import { deleteFavouriteById } from "@/app/actions";

jest.mock("@/app/actions");

describe("PokemonCard", () => {
  const mockPokemon: FavouritePokemon = {
    pokemon_id: 25,
    pokemon_name: "Pikachu",
    original_description: "An electric mouse Pokemon",
    shakespearean_description: "A mouse of lightning!",
    created_at: new Date("2024-01-01"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render pokemon with all details", () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    expect(screen.getByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByText("An electric mouse Pokemon")).toBeInTheDocument();
    expect(screen.getByText("A mouse of lightning!")).toBeInTheDocument();
  });

  it("should handle null original description", () => {
    const pokemonWithNullDescription = {
      ...mockPokemon,
      original_description: "",
    };

    render(<PokemonCard pokemon={pokemonWithNullDescription} />);

    expect(screen.getByText("No description available")).toBeInTheDocument();
  });

  it("should handle null shakespearean description", () => {
    const pokemonWithNullShakespeare = {
      ...mockPokemon,
      shakespearean_description: "",
    };

    render(<PokemonCard pokemon={pokemonWithNullShakespeare} />);

    expect(
      screen.getByText("No Shakespearean translation available")
    ).toBeInTheDocument();
  });

  it("should format date correctly", () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    expect(screen.getByText(/Added:/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Jan 2024, 01:00/i)).toBeInTheDocument();
  });

  it("should handle missing created_at date", () => {
    const pokemonWithoutDate = {
      ...mockPokemon,
      created_at: undefined,
    };

    render(<PokemonCard pokemon={pokemonWithoutDate} />);

    expect(screen.queryByText(/Added:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/N\/A/i)).not.toBeInTheDocument();
  });

  describe("Delete functionality", () => {
    it("should render delete button", () => {
      render(<PokemonCard pokemon={mockPokemon} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      expect(deleteButton).toBeInTheDocument();
    });

    it("should successfully delete pokemon", async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();
      (deleteFavouriteById as jest.Mock).mockResolvedValue({ success: true });

      render(<PokemonCard pokemon={mockPokemon} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      await user.click(deleteButton);

      expect(deleteFavouriteById).toHaveBeenCalledWith(25);

      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(mockOnDelete).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should handle delete failure and show error message", async () => {
      const user = userEvent.setup();
      (deleteFavouriteById as jest.Mock).mockResolvedValue({ success: false });

      render(<PokemonCard pokemon={mockPokemon} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/unable to delete "pikachu"/i)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("should retry delete after failure", async () => {
      const user = userEvent.setup();
      (deleteFavouriteById as jest.Mock)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });

      render(<PokemonCard pokemon={mockPokemon} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/unable to delete "pikachu"/i)
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      });
    });

    it("should cancel error state", async () => {
      const user = userEvent.setup();
      (deleteFavouriteById as jest.Mock).mockResolvedValue({ success: false });

      render(<PokemonCard pokemon={mockPokemon} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/unable to delete "pikachu"/i)
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(
        screen.queryByText(/unable to delete "pikachu"/i)
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
        })
      ).toBeInTheDocument();
    });

    it("should show loading state when delete is in progress", async () => {
      const user = userEvent.setup();
      (deleteFavouriteById as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<PokemonCard pokemon={mockPokemon} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      await user.click(deleteButton);

      expect(screen.getByText("Deleting...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      });
    });

    it("should show retry button loading state", async () => {
      const user = userEvent.setup();
      (deleteFavouriteById as jest.Mock)
        .mockResolvedValueOnce({ success: false })
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ success: true }), 100)
            )
        );

      render(<PokemonCard pokemon={mockPokemon} />);

      const deleteButton = screen.getByRole("button", {
        name: `Delete ${mockPokemon?.pokemon_name} from Favourites`,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/unable to delete "pikachu"/i)
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      await user.click(retryButton);

      expect(screen.getByText("Retrying...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      });
    });
  });
});

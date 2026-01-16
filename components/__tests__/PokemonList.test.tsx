import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Pokemons } from "../PokemonList";
import { loadPokemons } from "@/app/actions";
import { mockPokemonSpeciesResponse } from "@/lib/__mocks__/sample";

jest.mock("@/app/actions");
const mockLoadPokemons = loadPokemons as jest.MockedFunction<
  typeof loadPokemons
>;

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

describe("Pokemon Fetch Species List", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render initial pokemons - success case
  it("should fetch Pokemons when button is clicked with empty initial list", async () => {
    mockLoadPokemons.mockResolvedValueOnce({
      success: true,
      data: {
        results: mockPokemonSpeciesResponse,
      },
    });

    render(<Pokemons initialFavourites={{ results: [] }} />);

    const fetchButton = screen.getByRole("button", {
      name: /Present Some Pokemon Names/i,
    });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockLoadPokemons).toHaveBeenCalledWith(0);
    });

    await waitFor(() => {
      expect(screen.getByText("Wormadam")).toBeInTheDocument();
      expect(screen.getByText("ivysaur")).toBeInTheDocument();
    });
  });

  // Test image loading spinner behavior
  it("should show spinner while image loads and hide it after load", async () => {
    render(
      <Pokemons initialFavourites={{ results: mockPokemonSpeciesResponse }} />
    );
    const spinners = document.querySelectorAll(".animate-spin");
    expect(spinners.length).toBeGreaterThan(0);
    const wormadamImage = screen.getByAltText("Wormadam");
    fireEvent.load(wormadamImage);

    await waitFor(() => {
      const remainingSpinners = document.querySelectorAll(".animate-spin");
      expect(remainingSpinners.length).toBe(spinners.length - 1);
    });
  });

  // Fetch pokemons - failure case with retry handling
  it("if fetching pokemons fails, should allow user to refetch", async () => {
    mockLoadPokemons.mockResolvedValueOnce({
      success: false,
      error: "Unable to load Pokémon. Please try again.",
      status: 500,
    });

    render(<Pokemons initialFavourites={{ results: [] }} />);

    const fetchButton = screen.getByRole("button", {
      name: /Present Some Pokemon Names/i,
    });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(mockLoadPokemons).toHaveBeenCalledWith(0);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load Pokémon. Please try again.")
      ).toBeInTheDocument();
    });

    // Mock successful retry
    mockLoadPokemons.mockResolvedValueOnce({
      success: true,
      data: {
        results: mockPokemonSpeciesResponse,
      },
    });

    const retryButton = screen.getByRole("button", {
      name: /Retry Load Pokemons/i,
    });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockLoadPokemons).toHaveBeenCalledTimes(2);
      expect(mockLoadPokemons).toHaveBeenCalledWith(0);
    });

    await waitFor(() => {
      expect(screen.getByText("Wormadam")).toBeInTheDocument();
      expect(screen.getByText("ivysaur")).toBeInTheDocument();
    });
  });

  // Safety check tests
  describe("Safety checks for missing data", () => {
    it("should render fallback UI when pokemonList is null", () => {
      // @ts-expect-error - Testing null safety check
      render(<Pokemons initialFavourites={null} />);

      expect(
        screen.getByText("No Pokémons have been loaded as yet.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Do you want to load some Pokémon?/i,
        })
      ).toBeInTheDocument();
    });

    it("should render fallback UI when pokemonList.results is missing", () => {
      // @ts-expect-error - Testing undefined results safety check
      render(<Pokemons initialFavourites={{}} />);

      expect(
        screen.getByText("No Pokémons have been loaded as yet.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Do you want to load some Pokémon?/i,
        })
      ).toBeInTheDocument();
    });

    it("should allow fetching Pokemon from fallback state", async () => {
      mockLoadPokemons.mockResolvedValueOnce({
        success: true,
        data: {
          results: mockPokemonSpeciesResponse,
        },
      });

      // @ts-expect-error - Testing null safety check
      render(<Pokemons initialFavourites={null} />);

      const loadButton = screen.getByRole("button", {
        name: /Do you want to load some Pokémon?/i,
      });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(mockLoadPokemons).toHaveBeenCalledWith(0);
      });

      await waitFor(() => {
        expect(screen.getByText("Wormadam")).toBeInTheDocument();
        expect(screen.getByText("ivysaur")).toBeInTheDocument();
      });
    });
  });
});

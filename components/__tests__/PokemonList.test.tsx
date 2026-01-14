import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Pokemons } from "../PokemonList";
import { loadPokemons } from "@/app/actions";
import {
  mockAdditionalPokemonSpeciesResponse,
  mockPokemonSpeciesResponse,
} from "@/lib/__mocks__/sample";

jest.mock("@/app/actions");
const mockLoadPokemons = loadPokemons as jest.MockedFunction<
  typeof loadPokemons
>;

describe("Pokemon Fetch Species List", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render initial pokemons - success case
  it("should fetch Pokemons when button is clicked", async () => {
    mockLoadPokemons.mockResolvedValue({
      success: true,
      data: mockAdditionalPokemonSpeciesResponse,
    });

    render(<Pokemons pokemons={mockPokemonSpeciesResponse} />);

    const fetchButton = screen.getByRole("button", {
      name: /Present Some Pokemon Names/i,
    });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("charmander")).toBeInTheDocument();
      expect(screen.getByText("charmeleon")).toBeInTheDocument();

      //Initial pokemons still present
      expect(screen.getByText("Wormadam")).toBeInTheDocument();
      expect(screen.getByText("ivysaur")).toBeInTheDocument();
    });

    expect(mockLoadPokemons).toHaveBeenCalledWith(2);
  });

  // Fetch pokemons - failure case with retry handling
  it("if fetching pokemons fails, should allow user to refetch", async () => {
    mockLoadPokemons.mockResolvedValueOnce({
      success: false,
      error: "Network Error",
      status: 500,
    });

    render(<Pokemons pokemons={mockPokemonSpeciesResponse} />);

    const fetchButton = screen.getByRole("button", {
      name: /Present Some Pokemon Names/i,
    });
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Error fetching Pokemons: Network Error/i)
      ).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", {
      name: /Retry Load Pokemons/i,
    });

    // Mock successful retry
    mockLoadPokemons.mockResolvedValueOnce({
      success: true,
      data: mockAdditionalPokemonSpeciesResponse,
    });

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("charmander")).toBeInTheDocument();
      expect(screen.getByText("charmeleon")).toBeInTheDocument();

      //Initial pokemons still present
      expect(screen.getByText("Wormadam")).toBeInTheDocument();
      expect(screen.getByText("ivysaur")).toBeInTheDocument();
    });

    expect(mockLoadPokemons).toHaveBeenCalledWith(2);
  });
});

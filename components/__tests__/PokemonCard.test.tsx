import { render, screen } from "@testing-library/react";
import { PokemonCard } from "../PokemonCard";
import { FavouritePokemon } from "@/types/favourite";

describe("PokemonCard", () => {
  const mockPokemon: FavouritePokemon = {
    pokemon_id: 25,
    pokemon_name: "Pikachu",
    original_description: "An electric mouse Pokemon",
    shakespearean_description: "A mouse of lightning!",
    created_at: new Date("2024-01-01"),
  };

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
});

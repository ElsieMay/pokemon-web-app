import { render, screen } from "@testing-library/react";
import Home from "../page";
import { PokemonList } from "@/components/PokemonList";

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render home page", async () => {
    const home = await Home();
    render(home);
    expect(screen.getByText("Pokemon Shakespeare Web App")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("should render PokemonList component", async () => {
    const home = await Home();
    render(home);
    expect(screen.getByText("Fetch Pokemons...")).toBeInTheDocument();
    expect(PokemonList).toBeDefined();
  });
});

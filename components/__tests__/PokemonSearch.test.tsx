import { searchPokemonByName } from "@/app/actions";
import { PokemonSearch } from "../PokemonSearch";
import { render, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/app/actions");
const mockSearchPokemonByName = searchPokemonByName as jest.MockedFunction<
  typeof searchPokemonByName
>;

describe("Pokemon Search by Name Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const pokemonName = "Wormadam";

  // Basic Rendering and Search Functionality - success case
  it("should call searchPokemonByName when search button is clicked", async () => {
    mockSearchPokemonByName.mockResolvedValue({
      success: true,
      data: {
        name: "Wormadam",
        description: "A test description",
        id: 413,
      },
    });

    const { getByLabelText, getByText } = render(
      <PokemonSearch name={pokemonName} />
    );

    const input = getByLabelText("Pokemon Name") as HTMLInputElement;
    const button = getByText("Search for Pokemon");

    expect(input.value).toBe(pokemonName);

    fireEvent.change(input, { target: { value: "Pikachu" } });
    expect(input.value).toBe("Pikachu");

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSearchPokemonByName).toHaveBeenCalledWith("Pikachu");
    });

    expect(button).toHaveTextContent("Search for Pokemon");

    await waitFor(() => {
      expect(button).toHaveTextContent("Search for Pokemon");
    });
  });

  // Error Handling - failure case
  it("should display an error message when search fails", async () => {
    mockSearchPokemonByName.mockResolvedValue({
      success: false,
      error: "Pokemon not found",
      status: 404,
    });

    const { getByLabelText, getByText, findByText } = render(
      <PokemonSearch name={pokemonName} />
    );

    const input = getByLabelText("Pokemon Name") as HTMLInputElement;
    const button = getByText("Search for Pokemon");

    expect(input.value).toBe(pokemonName);

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSearchPokemonByName).toHaveBeenCalledWith(pokemonName);
    });

    const errorMessage = await findByText(
      `Error fetching ${pokemonName}: Pokemon not found`
    );
    expect(errorMessage).toBeInTheDocument();

    const retryButton = getByText("Retry Search");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockSearchPokemonByName).toHaveBeenCalledTimes(2);
    });
  });
});

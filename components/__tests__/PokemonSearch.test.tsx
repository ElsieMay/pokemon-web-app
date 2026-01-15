import { searchPokemonByName } from "@/app/actions";
import { PokemonSearch } from "../PokemonSearch";
import { render, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/app/actions");
const mockSearchPokemonByName = searchPokemonByName as jest.MockedFunction<
  typeof searchPokemonByName
>;

// Mock TranslationBlock to capture and trigger onSaveSuccess
jest.mock("../TranslationBlock", () => ({
  TranslationBlock: ({
    pokemon,
    onSaveSuccess,
  }: {
    pokemon: { name: string; description: string; id: number };
    onSaveSuccess?: () => void;
  }) => (
    <div>
      <div data-testid="translation-block">{pokemon.name}</div>
      <button onClick={onSaveSuccess} data-testid="trigger-save">
        Trigger Save Success
      </button>
    </div>
  ),
}));

describe("Pokemon Search by Name Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const pokemonName = "Wormadam";

  // Basic Rendering and Search Functionality - success case
  it("should call searchPokemonByName when search button is clicked", async () => {
    const mockOnSaveSuccess = jest.fn();

    mockSearchPokemonByName.mockResolvedValue({
      success: true,
      data: {
        name: "Wormadam",
        description: "A test description",
        id: 413,
      },
    });

    const { getByLabelText, getByText, getByTestId } = render(
      <PokemonSearch name={pokemonName} onSaveSuccess={mockOnSaveSuccess} />
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

    // Test handleSaveSuccess callback
    const triggerSaveButton = getByTestId("trigger-save");
    fireEvent.click(triggerSaveButton);

    await waitFor(() => {
      expect(input.value).toBe("");
      expect(mockOnSaveSuccess).toHaveBeenCalledTimes(1);
    });
  });

  // Test rendering without initial name prop
  it("should render with empty input when name prop is not provided", () => {
    const { getByLabelText, getByText } = render(<PokemonSearch />);

    const input = getByLabelText("Pokemon Name") as HTMLInputElement;
    const button = getByText("Search for Pokemon");

    expect(input.value).toBe("");
    expect(button).toBeDisabled();
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
      `Pokémon "${pokemonName}" not found. Please check the spelling.`
    );
    expect(errorMessage).toBeInTheDocument();

    const retryButton = getByText("Retry Search");
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockSearchPokemonByName).toHaveBeenCalledTimes(2);
    });
  });

  it("should display an error message when search fails", async () => {
    mockSearchPokemonByName.mockResolvedValue({
      success: false,
      error: "Pokemon not found",
      status: 500,
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
      `Unable to find "${pokemonName}". Please try again.`
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

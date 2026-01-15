import { searchPokemonByName } from "@/app/actions";
import { PokemonSearch } from "../PokemonSearch";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import * as FavouritesSection from "../FavouritesSection";
import { TranslationBlockProps } from "../TranslationBlock";

jest.mock("@/app/actions");
jest.mock("../FavouritesSection", () => ({
  triggerFavouritesRefresh: jest.fn(),
}));

// Mock TranslationBlock to capture onSaveSuccess
let capturedOnSaveSuccess: (() => void) | null = null;
jest.mock("../TranslationBlock", () => ({
  TranslationBlock: ({ pokemon, onSaveSuccess }: TranslationBlockProps) => {
    capturedOnSaveSuccess = onSaveSuccess || null;
    return <div data-testid="translation-block">{pokemon.name}</div>;
  },
}));

const mockSearchPokemonByName = searchPokemonByName as jest.MockedFunction<
  typeof searchPokemonByName
>;

describe("Pokemon Search by Name Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const pokemonName = "Wormadam";

  // Success case - search and save
  it("should search for Pokemon and reset form after successful save", async () => {
    jest.useFakeTimers();
    const mockTriggerRefresh =
      FavouritesSection.triggerFavouritesRefresh as jest.Mock;
    mockTriggerRefresh.mockClear();

    mockSearchPokemonByName.mockResolvedValue({
      success: true,
      data: {
        name: "Pikachu",
        description: "Electric mouse",
        id: 25,
      },
    });

    const { getByLabelText, getByText, queryByTestId } = render(
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
      expect(queryByTestId("translation-block")).toBeInTheDocument();
    });

    expect(button).toHaveTextContent("Search for Pokemon");

    // Should then trigger the onSaveSuccess callback
    act(() => {
      if (capturedOnSaveSuccess) {
        capturedOnSaveSuccess();
      }
    });
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // After handleSaveSuccess, the form should be reset
    expect(input.value).toBe("");
    expect(queryByTestId("translation-block")).not.toBeInTheDocument();
    expect(mockTriggerRefresh).toHaveBeenCalled();

    jest.useRealTimers();
  });

  // Test rendering without initial name prop
  it("should render with empty input when name prop is not provided", () => {
    const { getByLabelText, getByText } = render(<PokemonSearch />);

    const input = getByLabelText("Pokemon Name") as HTMLInputElement;
    const button = getByText("Search for Pokemon");

    expect(input.value).toBe("");
    expect(button).toBeDisabled();
  });

  // Error Handling - failure cases
  it.each([
    {
      status: 404,
      expectedMessage: `Pokémon "${pokemonName}" not found. Please check the spelling.`,
      description: "404 error",
    },
    {
      status: 500,
      expectedMessage: `Unable to find "${pokemonName}". Please try again.`,
      description: "server error",
    },
  ])(
    "should display correct error message for $description",
    async ({ status, expectedMessage }) => {
      mockSearchPokemonByName.mockResolvedValue({
        success: false,
        error: "Pokemon not found",
        status,
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

      const errorMessage = await findByText(expectedMessage);
      expect(errorMessage).toBeInTheDocument();

      const retryButton = getByText("Retry Search");
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockSearchPokemonByName).toHaveBeenCalledTimes(2);
      });
    }
  );
});

import { render, waitFor, fireEvent } from "@testing-library/react";
import { TranslationBlock } from "../TranslationBlock";
import { mockPokemonNameAndDescription } from "@/lib/__mocks__/sample";
import { addToFavourites, translatePokemonDescription } from "@/app/actions";

jest.mock("@/app/actions");
const mockTranslatePokemonDescription =
  translatePokemonDescription as jest.MockedFunction<
    typeof translatePokemonDescription
  >;
const mockAddToFavourites = addToFavourites as jest.MockedFunction<
  typeof addToFavourites
>;

describe("tests for translated description block", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const translateButtonText = "Translate to Shakespearean English";
  const ShakespeareTranslation = "A yellow electric mouse, prithee.";

  // Test for handling null description
  it("should handle translation when description is null", async () => {
    const { getByRole } = render(
      <TranslationBlock
        pokemon={{ name: "Pikachu", description: null, id: 3 }}
      />
    );

    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: "Translated text",
    });

    const button = getByRole("button", { name: /Translate/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockTranslatePokemonDescription).toHaveBeenCalledWith("");
    });
  });

  // Should handle when response data is missing
  it("should handle translation service returning empty description", async () => {
    const { getByRole, getByText } = render(
      <TranslationBlock
        pokemon={{ name: "Pikachu", description: "An electric mouse.", id: 3 }}
      />
    );

    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: "",
    });

    const button = getByRole("button", { name: translateButtonText });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        getByText("Translation service returned an empty description.")
      ).toBeInTheDocument();
    });
  });

  // Test for handling missing pokemon name during reset
  it("should handle reset when pokemon name is missing", async () => {
    const { getByRole, getByText } = render(
      <TranslationBlock pokemon={{ name: "", description: null, id: 0 }} />
    );

    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: "A valiant Pokemon.",
    });

    const translateButton = getByRole("button", {
      name: translateButtonText,
    });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(getByText("A valiant Pokemon.")).toBeInTheDocument();
      expect(mockTranslatePokemonDescription).toHaveBeenCalledWith("");
    });

    const resetButton = getByRole("button", {
      name: "Show Original Description",
    });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(getByText("No description available.")).toBeInTheDocument();
    });
  });

  // Basic Rendering and Translate Functionality - success case
  it("should translate Pokemon description into Shakespearean English successfully on click", async () => {
    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: ShakespeareTranslation,
    });

    const { getByText, getByRole, findByText } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const button = getByRole("button", {
      name: translateButtonText,
    });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(getByText(ShakespeareTranslation)).toBeInTheDocument();
    });

    const resetButton = await findByText("Show Original Description");
    expect(resetButton).toBeInTheDocument();
  });

  // Error Handling - failure case for translation request
  it("should display an error message when translation fails and allow user to retry", async () => {
    mockTranslatePokemonDescription.mockResolvedValue({
      success: false,
      error: "Translation service is currently unavailable.",
      status: 503,
    });

    const { getByText, getByRole } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const button = getByRole("button", {
      name: translateButtonText,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        getByText(`Unable to translate description. Please try again later.`)
      ).toBeInTheDocument();
    });

    // Mock successful retry
    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: ShakespeareTranslation,
    });

    const retryButton = getByRole("button", { name: "Retry Search" });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(getByText(ShakespeareTranslation)).toBeInTheDocument();
    });
  });

  // Reset to Original Description Functionality
  it("should reset to original description on clicking 'Show Original Description' button", async () => {
    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: ShakespeareTranslation,
    });

    const { getByText, getByRole, findByText } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const translateButton = getByRole("button", {
      name: translateButtonText,
    });
    expect(translateButton).toBeInTheDocument();

    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(getByText(ShakespeareTranslation)).toBeInTheDocument();
    });

    const resetButton = await findByText("Show Original Description");
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(
        getByText(mockPokemonNameAndDescription.description ?? "")
      ).toBeInTheDocument();
    });
  });

  // Test case for storing favourite Pokemon - success case
  it("should save Pokemon to favourites successfully", async () => {
    const mockOnSaveSuccess = jest.fn();

    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: ShakespeareTranslation,
    });

    mockAddToFavourites.mockResolvedValue({
      success: true,
      data: {
        pokemon_name: mockPokemonNameAndDescription.name,
        pokemon_id: mockPokemonNameAndDescription.id,
        shakespearean_description: ShakespeareTranslation,
        original_description: mockPokemonNameAndDescription.description ?? "",
      },
    });

    const { getByRole, findByRole } = render(
      <TranslationBlock
        pokemon={mockPokemonNameAndDescription}
        onSaveSuccess={mockOnSaveSuccess}
      />
    );

    const translateButton = getByRole("button", { name: translateButtonText });
    fireEvent.click(translateButton);

    const saveButton = await findByRole("button", {
      name: /Add to Favourites/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddToFavourites).toHaveBeenCalledWith({
        pokemon_name: mockPokemonNameAndDescription.name,
        pokemon_id: mockPokemonNameAndDescription.id,
        shakespearean_description: ShakespeareTranslation,
        original_description: mockPokemonNameAndDescription.description,
      });
      expect(mockOnSaveSuccess).toHaveBeenCalledTimes(1);
    });
  });

  // Test case for storing favourite Pokemon - failure case
  it("should display error when saving to favourites fails", async () => {
    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: ShakespeareTranslation,
    });

    mockAddToFavourites.mockResolvedValue({
      success: false,
      error: "Failed to save favourite",
      status: 500,
    });

    const { getByRole, findByRole, getByText } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const translateButton = getByRole("button", { name: translateButtonText });
    fireEvent.click(translateButton);

    const saveButton = await findByRole("button", {
      name: /Add to Favourites/i,
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        getByText(
          `Unable to save to favourites. Please try again later or check if it's already saved.`
        )
      ).toBeInTheDocument();
    });
  });

  // Test edge cases with null/undefined values
  it("should handle null description when saving to favourites", async () => {
    const pokemonWithNullDescription = {
      name: "TestPokemon",
      id: 1,
      description: null,
    };

    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: ShakespeareTranslation,
    });

    mockAddToFavourites.mockResolvedValue({
      success: true,
      data: {
        pokemon_name: "TestPokemon",
        pokemon_id: 1,
        shakespearean_description: ShakespeareTranslation,
        original_description: "",
      },
    });

    const { getByRole, findByRole } = render(
      <TranslationBlock pokemon={pokemonWithNullDescription} />
    );

    const translateButton = getByRole("button", { name: translateButtonText });
    fireEvent.click(translateButton);

    const saveButton = await findByRole("button", {
      name: /Add to Favourites/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddToFavourites).toHaveBeenCalledWith({
        pokemon_name: "TestPokemon",
        pokemon_id: 1,
        shakespearean_description: ShakespeareTranslation,
        original_description: "",
      });
    });
  });

  it("should handle undefined translated description when saving to favourites", async () => {
    mockTranslatePokemonDescription.mockResolvedValue({
      success: true,
      data: "",
    });

    const { getByRole, getByText } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const translateButton = getByRole("button", { name: translateButtonText });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(
        getByText("Translation service returned an empty description.")
      ).toBeInTheDocument();
    });
  });
});

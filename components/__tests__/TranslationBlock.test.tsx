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

  // Error Handling - failure case
  it("should display an error message when translation fails", async () => {
    mockTranslatePokemonDescription.mockResolvedValue({
      success: false,
      error: "Translation service unavailable",
      status: 503,
    });

    const { getByText, getByRole } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const button = getByRole("button", {
      name: translateButtonText,
    });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        getByText("Error fetching translation: Translation service unavailable")
      ).toBeInTheDocument();
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
        getByText(mockPokemonNameAndDescription.description)
      ).toBeInTheDocument();
    });
  });

  // Test case for storing favourite Pokemon - success case
  it("should save Pokemon to favourites successfully", async () => {
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
        original_description: mockPokemonNameAndDescription.description,
      },
    });

    const { getByRole, findByRole } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
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
        getByText("Error saving to favourites: Failed to save favourite")
      ).toBeInTheDocument();
    });
  });
});

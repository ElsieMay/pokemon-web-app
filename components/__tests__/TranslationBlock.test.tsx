import { render, waitFor, fireEvent } from "@testing-library/react";
import { TranslationBlock } from "../TranslationBlock";
import { mockPokemonNameAndDescription } from "@/lib/__mocks__/sample";
import { translatePokemonDescription } from "@/app/actions";

jest.mock("@/app/actions");
const mockTranslatePokemonDescription =
  translatePokemonDescription as jest.MockedFunction<
    typeof translatePokemonDescription
  >;

describe("tests for translated description block", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const translateButtonText = "Translate to Shakespearean English";
  const ShakespeareTranslation = "A yellow electric mouse, prithee.";

  // Test for rendering TranslationBlock component with name and description
  it("should handle if no name is passed to component", async () => {
    const { getByText } = render(<TranslationBlock />);

    expect(getByText("Unknown Pokemon")).toBeInTheDocument();
    expect(getByText("No description available.")).toBeInTheDocument();
  });

  // Test for handling null description
  it("should handle translation when description is null", async () => {
    const { getByRole } = render(
      <TranslationBlock pokemon={{ name: "Pikachu", description: null }} />
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

  // Test for handling missing pokemon name during reset
  it("should handle reset when pokemon name is missing", async () => {
    const { getByRole, getByText } = render(
      <TranslationBlock pokemon={{ name: "", description: null }} />
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

  // Retry Translation Functionality after Failure
  it("should successfully retry translation after initial failure", async () => {
    mockTranslatePokemonDescription
      .mockResolvedValueOnce({
        success: false,
        error: "Translation service unavailable",
        status: 503,
      })
      .mockResolvedValueOnce({
        success: true,
        data: ShakespeareTranslation,
      });

    const { getByRole, getByText, queryByText } = render(
      <TranslationBlock pokemon={mockPokemonNameAndDescription} />
    );

    const button = getByRole("button", { name: translateButtonText });
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByText(/Error fetching translation/)).toBeInTheDocument();
    });

    const retryButton = getByRole("button", { name: "Retry Search" });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(getByText(ShakespeareTranslation)).toBeInTheDocument();
      expect(queryByText(/Error fetching translation/)).not.toBeInTheDocument();
    });
  });
});

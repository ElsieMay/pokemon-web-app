import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { ErrorBlock } from "../ErrorBlock";

describe("ErrorBlock", () => {
  it("renders error message and retry button", () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(
      <ErrorBlock error="Test error" onRetry={mockOnRetry} loading={false} />
    );

    expect(getByText("Test error")).toBeInTheDocument();
    expect(getByText("Retry")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(
      <ErrorBlock error="Test error" onRetry={mockOnRetry} loading={false} />
    );

    const retryButton = getByText("Retry");
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it("disables retry button and shows loading text when loading is true", () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(
      <ErrorBlock error="Test error" onRetry={mockOnRetry} loading={true} />
    );

    const retryButton = getByText("Retrying...");
    expect(retryButton).toBeDisabled();
  });
});

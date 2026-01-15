import { render, screen } from "@testing-library/react";
import ErrorMessage from "../error";

describe("ErrorMessage Component", () => {
  const mockError = new Error("Test error message");
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Basic rendering tests
  it("should render error boundary with heading and message", () => {
    render(<ErrorMessage error={mockError} reset={mockReset} />);

    expect(screen.getByText("Oops! Something went wrong.")).toBeInTheDocument();
    expect(
      screen.getByText("We encountered an unexpected error. Please try again.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      name: /oops! something went wrong/i,
    });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
  });

  it("should only console log actual error details in dev environment", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const envSpy = jest.replaceProperty(process.env, "NODE_ENV", "development");

    render(<ErrorMessage error={mockError} reset={mockReset} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error boundary caught:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
    envSpy.restore();
  });
});

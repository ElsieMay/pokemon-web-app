import { render } from "@testing-library/react";
import { TranslationBlock } from "../TranslationBlock";

describe("tests for translated description block", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle if no name is passed to component", async () => {
    const { getByText } = render(<TranslationBlock />);

    expect(getByText("Unknown Pokemon")).toBeInTheDocument();
    expect(getByText("No description available.")).toBeInTheDocument();
  });
});

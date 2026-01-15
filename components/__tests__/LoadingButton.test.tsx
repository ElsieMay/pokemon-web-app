import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { LoadingButton } from "../LoadingButton";

describe("LoadingButton", () => {
  it("renders children when not loading", () => {
    const { getByText } = render(
      <LoadingButton loading={false} onClick={() => {}}>
        Click Me
      </LoadingButton>
    );
    expect(getByText("Click Me")).toBeInTheDocument();
  });

  it("renders loading text when loading", () => {
    const { getByText } = render(
      <LoadingButton
        loading={true}
        loadingText="Please wait..."
        onClick={() => {}}
      >
        Click Me
      </LoadingButton>
    );
    expect(getByText("Please wait...")).toBeInTheDocument();
  });

  it("calls onClick when clicked and not loading", () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <LoadingButton loading={false} onClick={handleClick}>
        Click Me
      </LoadingButton>
    );
    fireEvent.click(getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when clicked and loading", () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <LoadingButton loading={true} onClick={handleClick}>
        Click Me
      </LoadingButton>
    );
    fireEvent.click(getByText("Loading..."));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

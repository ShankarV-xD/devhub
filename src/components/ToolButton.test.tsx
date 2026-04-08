import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToolButton } from "./ToolButton";
import { Download } from "lucide-react";

describe("ToolButton", () => {
  it("should render with label and icon", () => {
    render(
      <ToolButton
        icon={<Download size={16} data-testid="download-icon" />}
        label="Download"
        onClick={() => {}}
      />
    );

    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <ToolButton
        icon={<Download size={16} />}
        label="Download"
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should have correct accessibility attributes", () => {
    render(
      <ToolButton
        icon={<Download size={16} />}
        label="Download File"
        onClick={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /download file/i });
    expect(button).toBeInTheDocument();
  });

  it("should apply danger variant styling", () => {
    const { container } = render(
      <ToolButton
        icon={<Download size={16} />}
        label="Delete"
        onClick={() => {}}
        variant="danger"
      />
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-red-500");
  });

  it("should apply default styling when active prop is false", () => {
    const { container } = render(
      <ToolButton
        icon={<Download size={16} />}
        label="Default"
        onClick={() => {}}
        variant="default"
      />
    );

    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-zinc-900");
  });

  it("should handle click events properly", () => {
    const handleClick = vi.fn();
    render(
      <ToolButton
        icon={<Download size={16} />}
        label="Test Button"
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");

    // Click multiple times
    fireEvent.click(button);
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});

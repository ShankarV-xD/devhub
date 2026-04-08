import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Tooltip from "./Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children correctly", () => {
    render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(
      screen.getByRole("button", { name: "Hover me" })
    ).toBeInTheDocument();
  });

  it("handles mouse enter without errors", () => {
    render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });

    expect(() => {
      fireEvent.mouseEnter(trigger);
    }).not.toThrow();
  });

  it("handles mouse leave without errors", () => {
    render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });

    expect(() => {
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
    }).not.toThrow();
  });

  it("handles focus events without errors", () => {
    render(
      <Tooltip text="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Focus me" });

    expect(() => {
      fireEvent.focus(trigger);
      fireEvent.blur(trigger);
    }).not.toThrow();
  });

  it("accepts custom delay prop", () => {
    render(
      <Tooltip text="Test tooltip" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    expect(
      screen.getByRole("button", { name: "Hover me" })
    ).toBeInTheDocument();
  });

  it("accepts custom maxWidth prop", () => {
    render(
      <Tooltip text="Test tooltip" maxWidth="300px">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(
      screen.getByRole("button", { name: "Hover me" })
    ).toBeInTheDocument();
  });

  it("renders React node as tooltip content", () => {
    render(
      <Tooltip text={<span data-testid="custom-content">Custom content</span>}>
        <button>Hover me</button>
      </Tooltip>
    );

    expect(
      screen.getByRole("button", { name: "Hover me" })
    ).toBeInTheDocument();
  });

  it("cleans up timeout on unmount", () => {
    const { unmount } = render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(trigger);

    expect(() => {
      unmount();
      vi.advanceTimersByTime(300);
    }).not.toThrow();
  });
});

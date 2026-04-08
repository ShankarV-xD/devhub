import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorHeader } from "./EditorHeader";

describe("EditorHeader", () => {
  const mockProps = {
    activeView: "editor" as const,
    content: "test content",
    type: "json" as const,
    msg: null,
    contentStats: {
      chars: 12,
      words: 2,
      lines: 1,
      bytes: 12,
    },
    onClear: () => {},
    onDownload: () => {},
    onShare: () => {},
  };

  it("should render type badge", () => {
    render(<EditorHeader {...mockProps} />);
    expect(screen.getByText("json")).toBeInTheDocument();
  });

  it("should show content statistics", () => {
    render(<EditorHeader {...mockProps} />);
    expect(screen.getByText("12 chars")).toBeInTheDocument();
    expect(screen.getByText("2 words")).toBeInTheDocument();
    expect(screen.getByText("1 lines")).toBeInTheDocument();
  });

  it("should show success message", () => {
    const propsWithMsg = {
      ...mockProps,
      msg: { text: "Copied!", type: "success" as const },
    };
    render(<EditorHeader {...propsWithMsg} />);
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("should show waiting state when no content", () => {
    const propsNoContent = {
      ...mockProps,
      content: "",
      contentStats: null,
    };
    render(<EditorHeader {...propsNoContent} />);
    expect(screen.getByText("WAITING FOR INPUT...")).toBeInTheDocument();
  });
});

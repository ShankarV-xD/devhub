import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import JsonViewer from "./JsonViewer";

// Mock react-window and react-virtualized-auto-sizer since they don't work well in JSDOM without layout
vi.mock("react-window", () => ({
  List: ({ rowCount, rowComponent: Row, rowProps }: any) => (
    <div>
      {Array.from({ length: rowCount }).map((_, index) => (
        <Row key={index} index={index} style={{}} {...rowProps} />
      ))}
    </div>
  ),
}));

vi.mock("react-virtualized-auto-sizer", () => ({
  AutoSizer: ({ renderProp }: any) => renderProp({ height: 500, width: 500 }),
}));

describe("JsonViewer", () => {
  it("renders correctly", () => {
    const data = { foo: "bar" };
    render(<JsonViewer data={data} />);
    expect(screen.getByText("foo")).toBeDefined();
    expect(screen.getByText('"bar"')).toBeDefined();
  });

  it("matches snapshot", () => {
    const data = { foo: "bar", baz: [1, 2] };
    const { container } = render(<JsonViewer data={data} />);
    expect(container).toMatchSnapshot();
  });
});

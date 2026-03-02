import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Header from "@/components/layout/Header";

describe("Header", () => {
  it("사이트 로고/이름이 렌더링 되어야 한다", () => {
    render(<Header />);
    expect(screen.getByText(/YIN/i)).toBeInTheDocument();
  });

  it("네비게이션 링크가 있어야 한다", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /career/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("접근 가능한 nav 랜드마크가 있어야 한다", () => {
    render(<Header />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});

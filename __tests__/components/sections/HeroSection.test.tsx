import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeroSection from "@/components/sections/HeroSection";

describe("HeroSection", () => {
  it("이름이 렌더링되어야 한다", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Jin YoungIn/i)).toBeInTheDocument();
  });

  it("역할 소개가 렌더링되어야 한다", () => {
    render(<HeroSection />);
    expect(screen.getByText(/AI Engineer/i)).toBeInTheDocument();
  });

  it("CTA 링크가 2개 있어야 한다", () => {
    render(<HeroSection />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("h1 태그가 있어야 한다", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

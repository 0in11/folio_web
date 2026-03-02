import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutSection from "@/components/sections/AboutSection";

describe("AboutSection", () => {
  it("About 제목이 있어야 한다", () => {
    render(<AboutSection />);
    expect(screen.getByRole("heading", { name: /도메인 지식을/i })).toBeInTheDocument();
  });

  it("강점 3가지가 있어야 한다", () => {
    render(<AboutSection />);
    const strengths = screen.getAllByRole("listitem");
    expect(strengths.length).toBeGreaterThanOrEqual(3);
  });
});

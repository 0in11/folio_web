import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CareerSection from "@/components/sections/CareerSection";

describe("CareerSection", () => {
  it("섹션 제목이 있어야 한다", () => {
    render(<CareerSection />);
    expect(screen.getByRole("heading", { name: /career/i })).toBeInTheDocument();
  });

  it("경력 항목들이 렌더링되어야 한다", () => {
    render(<CareerSection />);
    const suresoft = screen.getAllByText("슈어소프트테크");
    expect(suresoft.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("한국평가데이터")).toBeInTheDocument();
  });
});

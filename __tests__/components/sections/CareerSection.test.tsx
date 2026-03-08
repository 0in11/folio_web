import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/payload", () => ({
  fetchCareerHistory: vi.fn().mockResolvedValue([
    {
      period: "2024.07 - 현재",
      company: "슈어소프트테크",
      role: "AI Engineer",
      keywords: ["LLM", "RAG"],
      current: true,
    },
    {
      period: "2023.01 - 2024.06",
      company: "한국평가데이터",
      role: "Data Analyst",
      keywords: ["Python", "SQL"],
    },
  ]),
}));

import CareerSection from "@/components/sections/CareerSection";

describe("CareerSection", () => {
  it("섹션 제목이 있어야 한다", async () => {
    const Component = await CareerSection();
    render(Component);
    expect(screen.getByRole("heading", { name: /career/i })).toBeInTheDocument();
  });

  it("경력 항목들이 렌더링되어야 한다", async () => {
    const Component = await CareerSection();
    render(Component);
    const suresoft = screen.getAllByText("슈어소프트테크");
    expect(suresoft.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("한국평가데이터")).toBeInTheDocument();
  });
});

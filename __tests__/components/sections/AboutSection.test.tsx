import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/payload", () => ({
  fetchFeaturedProjects: vi.fn().mockResolvedValue([{ id: "featured" }]),
  fetchMoreProjects: vi.fn().mockResolvedValue([{ id: "more" }]),
  fetchCareerHistory: vi.fn().mockResolvedValue([
    { company: "메가존클라우드" },
    { company: "슈어소프트테크" },
  ]),
  fetchAwards: vi.fn().mockResolvedValue([{ title: "Award" }]),
  fetchPublications: vi.fn().mockResolvedValue([{ title: "Publication" }]),
}));

import AboutSection from "@/components/sections/AboutSection";

describe("AboutSection", () => {
  it("About 제목이 있어야 한다", async () => {
    const Component = await AboutSection();
    render(Component);
    expect(screen.getByRole("heading", { name: /도메인 이해에서/i })).toBeInTheDocument();
  });

  it("강점 3가지가 있어야 한다", async () => {
    const Component = await AboutSection();
    render(Component);
    const strengths = screen.getAllByRole("listitem");
    expect(strengths.length).toBeGreaterThanOrEqual(3);
  });
});

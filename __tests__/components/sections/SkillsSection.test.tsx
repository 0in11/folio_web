import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/payload", () => ({
  fetchSkillGroups: vi.fn().mockResolvedValue([
    {
      label: "Core Stack",
      description: "Primary technologies",
      items: ["Python", "TypeScript", "React"],
    },
  ]),
}));

import SkillsSection from "@/components/sections/SkillsSection";

describe("SkillsSection", () => {
  it("Skills 제목이 있어야 한다", async () => {
    const Component = await SkillsSection();
    render(Component);
    expect(screen.getByRole("heading", { name: /skills/i })).toBeInTheDocument();
  });

  it("Core Stack 그룹이 있어야 한다", async () => {
    const Component = await SkillsSection();
    render(Component);
    expect(screen.getByText("Core Stack")).toBeInTheDocument();
  });

  it("Python이 Core Stack에 있어야 한다", async () => {
    const Component = await SkillsSection();
    render(Component);
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
});

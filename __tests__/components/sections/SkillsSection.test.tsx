import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SkillsSection from "@/components/sections/SkillsSection";

describe("SkillsSection", () => {
  it("Skills 제목이 있어야 한다", () => {
    render(<SkillsSection />);
    expect(screen.getByRole("heading", { name: /skills/i })).toBeInTheDocument();
  });

  it("Core Stack 그룹이 있어야 한다", () => {
    render(<SkillsSection />);
    expect(screen.getByText("Core Stack")).toBeInTheDocument();
  });

  it("Python이 Core Stack에 있어야 한다", () => {
    render(<SkillsSection />);
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
});

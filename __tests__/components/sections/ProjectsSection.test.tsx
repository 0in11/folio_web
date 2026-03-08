import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/payload", () => ({
  fetchFeaturedProjects: vi.fn().mockResolvedValue([
    {
      id: "project-1",
      slug: "project-1",
      title: "해양 법령 GraphRAG 시스템",
      company: "Company A",
      description: "Test description",
      period: "2024.01 - 2024.06",
      teamSize: "3명",
      technologies: ["Python", "LangGraph"],
      keyAchievement: "Achievement",
      featured: true,
    },
    {
      id: "project-2",
      slug: "project-2",
      title: "On-Premise RAG 챗봇",
      company: "Company B",
      description: "Test description 2",
      period: "2024.01 - 2024.06",
      teamSize: "4명",
      technologies: ["Python"],
      keyAchievement: "Achievement 2",
      featured: true,
    },
    {
      id: "project-3",
      slug: "project-3",
      title: "도메인 특화 sLLM 개발",
      company: "Company C",
      description: "Test description 3",
      period: "2024.01 - 2024.06",
      teamSize: "5명",
      technologies: ["Python"],
      keyAchievement: "Achievement 3",
      featured: true,
    },
  ]),
  fetchMoreProjects: vi.fn().mockResolvedValue([]),
}));

import ProjectsSection from "@/components/sections/ProjectsSection";

describe("ProjectsSection", () => {
  it("섹션 제목이 있어야 한다", async () => {
    const Component = await ProjectsSection();
    render(Component);
    expect(screen.getByRole("heading", { name: /selected projects/i })).toBeInTheDocument();
  });

  it("Featured 프로젝트 3개가 렌더링되어야 한다", async () => {
    const Component = await ProjectsSection();
    render(Component);
    expect(screen.getByText("해양 법령 GraphRAG 시스템")).toBeInTheDocument();
    expect(screen.getByText("On-Premise RAG 챗봇")).toBeInTheDocument();
    expect(screen.getByText("도메인 특화 sLLM 개발")).toBeInTheDocument();
  });
});

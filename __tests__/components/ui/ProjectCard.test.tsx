import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/data/projects";

const mockProject: Project = {
  id: "test-1",
  slug: "test-project",
  title: "테스트 프로젝트",
  company: "테스트 회사",
  description: "테스트 설명입니다.",
  period: "2025.01 – 2025.06",
  teamSize: "3인",
  technologies: ["Python", "FastAPI"],
  keyAchievement: "주요 성과",
  featured: false,
};

describe("ProjectCard", () => {
  it("프로젝트 제목이 렌더링되어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("테스트 프로젝트")).toBeInTheDocument();
  });

  it("회사명이 렌더링되어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("테스트 회사")).toBeInTheDocument();
  });

  it("기술 스택 뱃지가 렌더링되어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
  });

  it("상세 보기 링크가 있어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/test-project");
  });
});

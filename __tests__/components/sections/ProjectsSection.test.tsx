import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProjectsSection from "@/components/sections/ProjectsSection";

describe("ProjectsSection", () => {
  it("섹션 제목이 있어야 한다", () => {
    render(<ProjectsSection />);
    expect(screen.getByRole("heading", { name: /selected projects/i })).toBeInTheDocument();
  });

  it("Featured 프로젝트 3개가 렌더링되어야 한다", () => {
    render(<ProjectsSection />);
    expect(screen.getByText("해양 법령 GraphRAG 시스템")).toBeInTheDocument();
    expect(screen.getByText("On-Premise RAG 챗봇")).toBeInTheDocument();
    expect(screen.getByText("도메인 특화 sLLM 개발")).toBeInTheDocument();
  });
});

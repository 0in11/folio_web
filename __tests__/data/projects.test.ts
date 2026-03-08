import { describe, it, expect } from "vitest";
import { projects, getFeaturedProjects, getProjectBySlug } from "@/data/_static/projects";

describe("projects data", () => {
  it("최소 3개 이상의 프로젝트가 있어야 한다", () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  it("featured 프로젝트가 정확히 3개여야 한다", () => {
    const featured = getFeaturedProjects();
    expect(featured).toHaveLength(3);
  });

  it("모든 프로젝트에 필수 필드가 있어야 한다", () => {
    projects.forEach((project) => {
      expect(project.id).toBeTruthy();
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.company).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.technologies).toBeInstanceOf(Array);
      expect(project.technologies.length).toBeGreaterThan(0);
    });
  });

  it("slug로 프로젝트를 찾을 수 있어야 한다", () => {
    const first = projects[0];
    const found = getProjectBySlug(first.slug);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it("존재하지 않는 slug는 undefined를 반환해야 한다", () => {
    const result = getProjectBySlug("non-existent-slug");
    expect(result).toBeUndefined();
  });
});

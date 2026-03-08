import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/payload", () => ({
  fetchAwards: vi.fn().mockResolvedValue([
    { title: "AI 경진대회 대상", date: "2024.06", organizer: "한국정보과학회" },
  ]),
  fetchPublications: vi.fn().mockResolvedValue([
    { title: "연구 논문 제목", journal: "학술지명", year: 2024 },
  ]),
  fetchEducation: vi.fn().mockResolvedValue([
    { institution: "서울대학교", degree: "컴퓨터공학 석사", period: "2020 - 2022" },
  ]),
  fetchCertifications: vi.fn().mockResolvedValue([
    { name: "정보처리기사", date: "2023.06" },
  ]),
}));

import CredentialsSection from "@/components/sections/CredentialsSection";

describe("CredentialsSection", () => {
  it("섹션 제목이 있어야 한다", async () => {
    const Component = await CredentialsSection();
    render(Component);
    expect(screen.getByRole("heading", { name: /credentials/i })).toBeInTheDocument();
  });

  it("Education 항목이 렌더링되어야 한다", async () => {
    const Component = await CredentialsSection();
    render(Component);
    expect(screen.getByText("서울대학교")).toBeInTheDocument();
  });

  it("Awards 항목이 렌더링되어야 한다", async () => {
    const Component = await CredentialsSection();
    render(Component);
    expect(screen.getByText("AI 경진대회 대상")).toBeInTheDocument();
  });

  it("Certifications 항목이 렌더링되어야 한다", async () => {
    const Component = await CredentialsSection();
    render(Component);
    expect(screen.getByText("정보처리기사")).toBeInTheDocument();
  });

  it("Publications 항목이 렌더링되어야 한다", async () => {
    const Component = await CredentialsSection();
    render(Component);
    expect(screen.getByText("연구 논문 제목")).toBeInTheDocument();
  });
});

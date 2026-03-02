import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactSection from "@/components/sections/ContactSection";

describe("ContactSection", () => {
  it("Contact 섹션 제목이 있어야 한다", () => {
    render(<ContactSection />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("이메일 링크가 있어야 한다", () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole("link", { name: /email/i });
    expect(emailLink).toHaveAttribute("href", expect.stringContaining("mailto:"));
  });

  it("GitHub 링크가 있어야 한다", () => {
    render(<ContactSection />);
    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink).toBeInTheDocument();
  });
});

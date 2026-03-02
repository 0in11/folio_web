import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FadeIn from "@/components/ui/FadeIn";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div data-testid="motion" {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => true,
}));

describe("FadeIn", () => {
  it("reduced motion 환경에서도 콘텐츠를 그대로 렌더링한다", () => {
    render(
      <FadeIn className="wrapper">
        <span>content</span>
      </FadeIn>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("className을 적용한다", () => {
    const { container } = render(
      <FadeIn className="test-class">
        <span>test</span>
      </FadeIn>,
    );

    expect(container.firstChild).toHaveClass("test-class");
  });
});

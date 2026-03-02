import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("단일 클래스를 반환해야 한다", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("여러 클래스를 합쳐야 한다", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("falsy 값은 무시해야 한다", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("Tailwind 충돌 클래스를 올바르게 병합해야 한다", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

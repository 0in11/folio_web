import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("payload", () => ({
  getPayload: vi.fn(),
}));

vi.mock("@payload-config", () => ({
  default: {},
}));

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  revalidateTag: vi.fn(),
}));

import { withFallback } from "@/lib/payload";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("withFallback", () => {
  it("should return payload result when fetch succeeds", async () => {
    const result = await withFallback(
      async () => "payload-data",
      () => "static-data",
      "test",
    );
    expect(result).toBe("payload-data");
  });

  it("should return fallback in development when fetch fails", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const result = await withFallback(
      async () => {
        throw new Error("DB connection failed");
      },
      () => "static-data",
      "fetchTest",
    );

    expect(result).toBe("static-data");
  });

  it("should log warning in development when not in VITEST", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const origVitest = process.env.VITEST;
    delete process.env.VITEST;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await withFallback(
      async () => {
        throw new Error("DB connection failed");
      },
      () => "static-data",
      "fetchTest",
    );

    expect(warnSpy).toHaveBeenCalledWith(
      "[fetchTest] DB connection failed, using static fallback:",
      "DB connection failed",
    );
    process.env.VITEST = origVitest;
  });

  it("should throw wrapped error in production when fetch fails", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      withFallback(
        async () => {
          throw new Error("DB connection failed");
        },
        () => "static-data",
        "fetchTest",
      ),
    ).rejects.toThrow(
      "[fetchTest] DB connection failed in production: DB connection failed",
    );
  });

  it("should handle non-Error throws gracefully", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const result = await withFallback(
      async () => {
        throw "string-error";
      },
      () => "fallback",
      "fetchTest",
    );

    expect(result).toBe("fallback");
  });

  it("should use default label when none provided", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      withFallback(
        async () => {
          throw new Error("fail");
        },
        () => "fallback",
      ),
    ).rejects.toThrow(
      "[Payload fetch] DB connection failed in production: fail",
    );
  });

  it("should return fallback data that matches static data shape", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const staticData = [
      { label: "Core Stack", description: "Primary", items: ["Python"] },
    ];

    const result = await withFallback(
      async () => {
        throw new Error("DB down");
      },
      () => staticData,
      "fetchSkillGroups",
    );

    expect(result).toEqual(staticData);
    expect(result[0]).toHaveProperty("label");
    expect(result[0]).toHaveProperty("items");
  });
});

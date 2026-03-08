import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ensureAdminUser } from "@/scripts/seed";

function createMockPayload(totalDocs: number) {
  return {
    find: vi.fn().mockResolvedValue({ totalDocs }),
    create: vi.fn().mockResolvedValue({}),
  };
}

describe("ensureAdminUser", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates the admin user when the configured admin email is missing", async () => {
    const payload = createMockPayload(0);

    await ensureAdminUser(payload);

    expect(payload.find).toHaveBeenCalledWith({
      collection: "users",
      where: { email: { equals: "admin@example.com" } },
      limit: 1,
    });
    expect(payload.create).toHaveBeenCalledWith({
      collection: "users",
      data: {
        email: "admin@example.com",
        password: "changeme123",
        name: "Admin",
      },
    });
  });

  it("skips creation when the configured admin email already exists", async () => {
    const payload = createMockPayload(1);

    await ensureAdminUser(payload);

    expect(payload.create).not.toHaveBeenCalled();
  });
});

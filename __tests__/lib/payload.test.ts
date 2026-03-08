import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

import {
  transformProject,
  transformCareer,
  transformSkill,
  withFallback,
  fetchFeaturedProjects,
  fetchMoreProjects,
  fetchProjectBySlug,
  fetchAllProjectSlugs,
  fetchCareerHistory,
  fetchSkillGroups,
  fetchEducation,
  fetchCertifications,
  fetchAwards,
  fetchPublications,
} from "@/lib/payload";
import { getPayload } from "payload";

const mockGetPayload = vi.mocked(getPayload);

afterEach(() => {
  vi.unstubAllEnvs();
});

// ─── Mock Data Factories ────────────────────────────────────────

function createMockPayloadProject(overrides: Record<string, unknown> = {}) {
  return {
    id: "payload-internal-id-123",
    projectId: "graphrag-maritime",
    slug: "graphrag-maritime-law",
    title: "GraphRAG System",
    company: "SURESOFT",
    description: "A GraphRAG-based system",
    period: "2025.09 - 2025.12",
    teamSize: "3",
    keyAchievement: "Improved accuracy",
    featured: true,
    technologies: [
      { value: "Python", id: "tech-1" },
      { value: "Neo4j", id: "tech-2" },
    ],
    links: {
      github: "https://github.com/example",
      demo: null,
      paper: null,
    },
    detail: {
      problem: "Complex legal structure",
      role: "Lead architect",
      architecture: null,
      implementation: null,
      impact: null,
      learnings: null,
      architectureImage: null,
      demoImages: [],
      sections: [],
    },
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    ...overrides,
  };
}

function createMockPayloadCareer(overrides: Record<string, unknown> = {}) {
  return {
    id: "career-id-1",
    period: "2025.12 -",
    company: "SURESOFT",
    role: "Researcher",
    current: true,
    sortOrder: 1,
    keywords: [
      { value: "GraphRAG", id: "kw-1" },
      { value: "sLLM", id: "kw-2" },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    ...overrides,
  };
}

function createMockPayloadSkill(overrides: Record<string, unknown> = {}) {
  return {
    id: "skill-id-1",
    label: "Core Stack",
    description: "Primary technologies",
    sortOrder: 1,
    items: [
      { value: "Python", id: "item-1" },
      { value: "FastAPI", id: "item-2" },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    ...overrides,
  };
}

function createMockPayloadFind(docs: unknown[]) {
  return {
    find: vi.fn().mockResolvedValue({ docs }),
  };
}

// ─── Transform Tests ────────────────────────────────────────────

describe("transformProject", () => {
  it("should map projectId to id (not internal Payload id)", () => {
    const doc = createMockPayloadProject();
    const result = transformProject(doc);
    expect(result.id).toBe("graphrag-maritime");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("updatedAt");
  });

  it("should flatten technologies array to string[]", () => {
    const doc = createMockPayloadProject();
    const result = transformProject(doc);
    expect(result.technologies).toEqual(["Python", "Neo4j"]);
  });

  it("should handle empty technologies array", () => {
    const doc = createMockPayloadProject({ technologies: [] });
    const result = transformProject(doc);
    expect(result.technologies).toEqual([]);
  });

  it("should handle null technologies", () => {
    const doc = createMockPayloadProject({ technologies: null });
    const result = transformProject(doc);
    expect(result.technologies).toEqual([]);
  });

  it("should include links only when at least one is present", () => {
    const doc = createMockPayloadProject({
      links: { github: "https://github.com/test", demo: null, paper: null },
    });
    const result = transformProject(doc);
    expect(result.links).toEqual({ github: "https://github.com/test" });
  });

  it("should omit links when all are null", () => {
    const doc = createMockPayloadProject({
      links: { github: null, demo: null, paper: null },
    });
    const result = transformProject(doc);
    expect(result.links).toBeUndefined();
  });

  it("should omit links when links is null", () => {
    const doc = createMockPayloadProject({ links: null });
    const result = transformProject(doc);
    expect(result.links).toBeUndefined();
  });

  it("should transform detail with problem and role", () => {
    const doc = createMockPayloadProject();
    const result = transformProject(doc);
    expect(result.detail?.problem).toBe("Complex legal structure");
    expect(result.detail?.role).toBe("Lead architect");
  });

  it("should return undefined detail when all detail fields are empty", () => {
    const doc = createMockPayloadProject({
      detail: {
        problem: null,
        role: null,
        architecture: null,
        implementation: null,
        impact: null,
        learnings: null,
        architectureImage: null,
        demoImages: [],
        sections: [],
      },
    });
    const result = transformProject(doc);
    expect(result.detail).toBeUndefined();
  });

  it("should ignore empty architectureImage when deciding if detail exists", () => {
    const doc = createMockPayloadProject({
      detail: {
        problem: null,
        role: null,
        architecture: null,
        implementation: null,
        impact: null,
        learnings: null,
        architectureImage: {},
        demoImages: [],
        sections: [],
      },
    });
    const result = transformProject(doc);
    expect(result.detail).toBeUndefined();
  });

  it("should default featured to false when undefined", () => {
    const doc = createMockPayloadProject({ featured: undefined });
    const result = transformProject(doc);
    expect(result.featured).toBe(false);
  });
});

describe("transformProject - detail sections", () => {
  it("should transform tableHeaders from {col0, col1} to [string, string]", () => {
    const doc = createMockPayloadProject({
      detail: {
        problem: null,
        role: null,
        architecture: null,
        implementation: null,
        impact: null,
        learnings: null,
        architectureImage: null,
        demoImages: [],
        sections: [
          {
            title: "Tech Stack",
            content: null,
            image: null,
            imagePosition: null,
            tableHeaders: { col0: "Category", col1: "Technology" },
            table: [{ label: "LLM", value: "GPT-4", id: "row-1" }],
            subsections: [],
            id: "section-1",
          },
        ],
      },
    });
    const result = transformProject(doc);
    expect(result.detail?.sections?.[0].tableHeaders).toEqual([
      "Category",
      "Technology",
    ]);
  });

  it("should omit tableHeaders when col0 or col1 is missing", () => {
    const doc = createMockPayloadProject({
      detail: {
        problem: null,
        role: null,
        architecture: null,
        implementation: null,
        impact: null,
        learnings: null,
        architectureImage: null,
        demoImages: [],
        sections: [
          {
            title: "Partial Headers",
            content: null,
            image: null,
            imagePosition: null,
            tableHeaders: { col0: "Only One", col1: null },
            table: [],
            subsections: [],
            id: "section-2",
          },
        ],
      },
    });
    const result = transformProject(doc);
    expect(result.detail?.sections?.[0].tableHeaders).toBeUndefined();
  });

  it("should transform subsections correctly", () => {
    const doc = createMockPayloadProject({
      detail: {
        problem: null,
        role: null,
        architecture: null,
        implementation: null,
        impact: null,
        learnings: null,
        architectureImage: null,
        demoImages: [],
        sections: [
          {
            title: "Challenges",
            content: null,
            image: null,
            imagePosition: null,
            tableHeaders: null,
            table: [],
            subsections: [
              {
                title: "Challenge 1",
                content: "Description of challenge",
                id: "sub-1",
              },
            ],
            id: "section-3",
          },
        ],
      },
    });
    const result = transformProject(doc);
    expect(result.detail?.sections?.[0].subsections).toEqual([
      { title: "Challenge 1", content: "Description of challenge" },
    ]);
  });

  it("should transform section image correctly", () => {
    const doc = createMockPayloadProject({
      detail: {
        problem: null,
        role: null,
        architecture: null,
        implementation: null,
        impact: null,
        learnings: null,
        architectureImage: null,
        demoImages: [],
        sections: [
          {
            title: "Architecture",
            content: "System overview",
            image: {
              src: "/img/arch.png",
              alt: "Architecture diagram",
              caption: "System diagram",
            },
            imagePosition: "after",
            tableHeaders: null,
            table: [],
            subsections: [],
            id: "section-4",
          },
        ],
      },
    });
    const result = transformProject(doc);
    const section = result.detail?.sections?.[0];
    expect(section?.image).toEqual({
      src: "/img/arch.png",
      alt: "Architecture diagram",
      caption: "System diagram",
    });
    expect(section?.imagePosition).toBe("after");
  });
});

describe("transformCareer", () => {
  it("should flatten keywords array to string[]", () => {
    const doc = createMockPayloadCareer();
    const result = transformCareer(doc);
    expect(result.keywords).toEqual(["GraphRAG", "sLLM"]);
  });

  it("should include current flag when true", () => {
    const doc = createMockPayloadCareer({ current: true });
    const result = transformCareer(doc);
    expect(result.current).toBe(true);
  });

  it("should omit current flag when false", () => {
    const doc = createMockPayloadCareer({ current: false });
    const result = transformCareer(doc);
    expect(result.current).toBeUndefined();
  });

  it("should strip Payload metadata", () => {
    const doc = createMockPayloadCareer();
    const result = transformCareer(doc);
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("updatedAt");
    expect(result).not.toHaveProperty("sortOrder");
  });
});

describe("transformSkill", () => {
  it("should flatten items array to string[]", () => {
    const doc = createMockPayloadSkill();
    const result = transformSkill(doc);
    expect(result.items).toEqual(["Python", "FastAPI"]);
  });

  it("should strip Payload metadata", () => {
    const doc = createMockPayloadSkill();
    const result = transformSkill(doc);
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("sortOrder");
  });
});

// ─── Fetch Function Export Tests ────────────────────────────────

describe("fetch function exports", () => {
  it("should export all 10 fetch functions", () => {
    expect(typeof fetchFeaturedProjects).toBe("function");
    expect(typeof fetchMoreProjects).toBe("function");
    expect(typeof fetchProjectBySlug).toBe("function");
    expect(typeof fetchAllProjectSlugs).toBe("function");
    expect(typeof fetchCareerHistory).toBe("function");
    expect(typeof fetchSkillGroups).toBe("function");
    expect(typeof fetchEducation).toBe("function");
    expect(typeof fetchCertifications).toBe("function");
    expect(typeof fetchAwards).toBe("function");
    expect(typeof fetchPublications).toBe("function");
  });
});

// ─── Fetch Function Integration Tests ───────────────────────────

describe("fetchFeaturedProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed projects from Payload", async () => {
    const mockDoc = createMockPayloadProject({ featured: true });
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchFeaturedProjects();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("graphrag-maritime");
    expect(result[0].technologies).toEqual(["Python", "Neo4j"]);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: "projects",
      where: { featured: { equals: true } },
      limit: 100,
    });
  });

  it("should fallback to static data in dev when Payload fails", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockGetPayload.mockRejectedValue(new Error("DB connection failed"));

    const result = await fetchFeaturedProjects();

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.featured)).toBe(true);
  });

  it("should rethrow in production when Payload fails", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mockGetPayload.mockRejectedValue(new Error("DB connection failed"));

    await expect(fetchFeaturedProjects()).rejects.toThrow(
      "[fetchFeaturedProjects] DB connection failed in production: DB connection failed",
    );
  });
});

describe("fetchMoreProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query for non-featured projects", async () => {
    const mockDoc = createMockPayloadProject({ featured: false });
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchMoreProjects();

    expect(result).toHaveLength(1);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: "projects",
      where: { featured: { equals: false } },
      limit: 100,
    });
  });
});

describe("fetchProjectBySlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a single project by slug", async () => {
    const mockDoc = createMockPayloadProject();
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchProjectBySlug("graphrag-maritime-law");

    expect(result?.slug).toBe("graphrag-maritime-law");
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: "projects",
      where: { slug: { equals: "graphrag-maritime-law" } },
      limit: 1,
    });
  });

  it("should return undefined when no project found", async () => {
    const mockPayload = createMockPayloadFind([]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchProjectBySlug("nonexistent");

    expect(result).toBeUndefined();
  });
});

describe("fetchAllProjectSlugs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return array of slug strings", async () => {
    const mockDoc = createMockPayloadProject();
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchAllProjectSlugs();

    expect(result).toEqual(["graphrag-maritime-law"]);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: "projects",
      pagination: false,
      sort: "slug",
    });
  });
});

describe("fetchCareerHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed career items sorted by sortOrder", async () => {
    const mockDoc = createMockPayloadCareer();
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchCareerHistory();

    expect(result).toHaveLength(1);
    expect(result[0].company).toBe("SURESOFT");
    expect(result[0].keywords).toEqual(["GraphRAG", "sLLM"]);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: "career",
      sort: "sortOrder",
      limit: 100,
    });
  });
});

describe("fetchSkillGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed skill groups sorted by sortOrder", async () => {
    const mockDoc = createMockPayloadSkill();
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchSkillGroups();

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Core Stack");
    expect(result[0].items).toEqual(["Python", "FastAPI"]);
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: "skills",
      sort: "sortOrder",
      limit: 100,
    });
  });
});

describe("fetchEducation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed education items", async () => {
    const mockDoc = {
      id: "edu-1",
      institution: "SMU",
      degree: "CS",
      gpa: "4.1 / 4.5",
      period: "2020 - 2026",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
    };
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchEducation();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      institution: "SMU",
      degree: "CS",
      gpa: "4.1 / 4.5",
      period: "2020 - 2026",
    });
  });
});

describe("fetchCertifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed certifications", async () => {
    const mockDoc = {
      id: "cert-1",
      name: "AWS AI Practitioner",
      date: "2026.02",
      issuer: "AWS",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
    };
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchCertifications();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "AWS AI Practitioner",
      date: "2026.02",
      issuer: "AWS",
    });
  });
});

describe("fetchAwards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed awards", async () => {
    const mockDoc = {
      id: "award-1",
      title: "Best Project Award",
      date: "2024.05",
      organizer: "Tech Org",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
    };
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchAwards();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: "Best Project Award",
      date: "2024.05",
      organizer: "Tech Org",
    });
  });
});

describe("fetchPublications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed publications", async () => {
    const mockDoc = {
      id: "pub-1",
      title: "Text2VR Paper",
      journal: "KCI Journal",
      year: 2025,
      doi: "10.1234/test",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
    };
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchPublications();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: "Text2VR Paper",
      journal: "KCI Journal",
      year: 2025,
      doi: "10.1234/test",
    });
  });

  it("should omit doi when not present", async () => {
    const mockDoc = {
      id: "pub-2",
      title: "Another Paper",
      journal: "Some Journal",
      year: 2024,
      doi: null,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T00:00:00Z",
    };
    const mockPayload = createMockPayloadFind([mockDoc]);
    mockGetPayload.mockResolvedValue(mockPayload as never);

    const result = await fetchPublications();

    expect(result[0].doi).toBeUndefined();
  });
});

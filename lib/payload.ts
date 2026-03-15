import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import type { Project, ProjectDetail, DetailSection, ProjectImage } from "@/data/projects";
import type { CareerItem } from "@/data/career";
import type { SkillGroup } from "@/data/skills";
import type { Education, Certification } from "@/data/education";
import type { Award, Publication } from "@/data/awards";

import {
  projects as staticProjects,
  getFeaturedProjects as staticGetFeatured,
  getMoreProjects as staticGetMore,
  getProjectBySlug as staticGetBySlug,
} from "@/data/_static/projects";
import { careerHistory as staticCareer } from "@/data/_static/career";
import { skillGroups as staticSkills } from "@/data/_static/skills";
import {
  education as staticEducation,
  certifications as staticCertifications,
} from "@/data/_static/education";
import {
  awards as staticAwards,
  publications as staticPublications,
} from "@/data/_static/awards";

// ─── Raw Payload Document Types ─────────────────────────────────

interface PayloadImage {
  src?: string | null;
  alt?: string | null;
  caption?: string | null;
}

interface PayloadTableRow {
  label: string;
  value: string;
}

interface PayloadSubsection {
  title: string;
  content: string;
}

interface PayloadDetailSection {
  title: string;
  content?: string | null;
  image?: PayloadImage | null;
  imagePosition?: "before" | "after" | null;
  tableHeaders?: { col0?: string | null; col1?: string | null } | null;
  table?: PayloadTableRow[];
  subsections?: PayloadSubsection[];
}

interface PayloadProjectDetail {
  problem?: string | null;
  role?: string | null;
  architecture?: string | null;
  implementation?: string | null;
  impact?: string | null;
  learnings?: string | null;
  architectureImage?: PayloadImage | null;
  demoImages?: PayloadImage[];
  sections?: PayloadDetailSection[];
}

interface PayloadProjectDoc {
  projectId: string;
  slug: string;
  title: string;
  company: string;
  description: string;
  period: string;
  teamSize: string;
  keyAchievement: string;
  featured?: boolean;
  technologies?: Array<{ value: string }> | null;
  links?: { github?: string | null; demo?: string | null; paper?: string | null } | null;
  markdownContent?: string | null;
  detail?: PayloadProjectDetail | null;
}

interface PayloadCareerDoc {
  period: string;
  company: string;
  role: string;
  current?: boolean;
  keywords?: Array<{ value: string }> | null;
}

interface PayloadSkillDoc {
  label: string;
  description: string;
  items?: Array<{ value: string }> | null;
}

interface PayloadEducationDoc {
  institution: string;
  degree: string;
  gpa?: string | null;
  period: string;
}

interface PayloadCertificationDoc {
  name: string;
  date: string;
  issuer?: string | null;
}

interface PayloadAwardDoc {
  title: string;
  date: string;
  organizer?: string | null;
}

interface PayloadPublicationDoc {
  title: string;
  journal: string;
  year: number;
  doi?: string | null;
}

// ─── Transform Helpers ──────────────────────────────────────────

function transformImage(
  img: PayloadImage | null | undefined,
): ProjectImage | undefined {
  if (!img || !img.src) return undefined;
  return {
    src: img.src,
    alt: img.alt ?? "",
    ...(img.caption ? { caption: img.caption } : {}),
  };
}

function transformDetailSection(section: PayloadDetailSection): DetailSection {
  return {
    title: section.title,
    ...(section.content ? { content: section.content } : {}),
    ...(section.image
      ? { image: transformImage(section.image) }
      : {}),
    ...(section.imagePosition
      ? { imagePosition: section.imagePosition }
      : {}),
    ...(section.tableHeaders?.col0 && section.tableHeaders?.col1
      ? { tableHeaders: [section.tableHeaders.col0, section.tableHeaders.col1] as [string, string] }
      : {}),
    ...(Array.isArray(section.table) && section.table.length > 0
      ? {
          table: section.table.map((t) => ({
            label: t.label,
            value: t.value,
          })),
        }
      : {}),
    ...(Array.isArray(section.subsections) && section.subsections.length > 0
      ? {
          subsections: section.subsections.map((s) => ({
            title: s.title,
            content: s.content,
          })),
        }
      : {}),
  };
}

function transformDetail(
  detail: PayloadProjectDetail | null | undefined,
): ProjectDetail | undefined {
  if (!detail) return undefined;

  const architectureImage = transformImage(detail.architectureImage);
  const demoImages =
    Array.isArray(detail.demoImages) && detail.demoImages.length > 0
      ? detail.demoImages
          .map(transformImage)
          .filter((img): img is ProjectImage => img !== undefined)
      : undefined;
  const sections =
    Array.isArray(detail.sections) && detail.sections.length > 0
      ? detail.sections.map(transformDetailSection)
      : undefined;

  const hasContent =
    detail.problem ||
    detail.role ||
    detail.architecture ||
    detail.implementation ||
    detail.impact ||
    detail.learnings ||
    architectureImage ||
    (demoImages && demoImages.length > 0) ||
    (sections && sections.length > 0);

  if (!hasContent) return undefined;

  return {
    ...(detail.problem ? { problem: detail.problem } : {}),
    ...(detail.role ? { role: detail.role } : {}),
    ...(detail.architecture ? { architecture: detail.architecture } : {}),
    ...(detail.implementation ? { implementation: detail.implementation } : {}),
    ...(detail.impact ? { impact: detail.impact } : {}),
    ...(detail.learnings ? { learnings: detail.learnings } : {}),
    ...(architectureImage ? { architectureImage } : {}),
    ...(demoImages && demoImages.length > 0 ? { demoImages } : {}),
    ...(sections && sections.length > 0 ? { sections } : {}),
  };
}

export function transformProject(doc: PayloadProjectDoc): Project {
  const links = doc.links;
  return {
    id: doc.projectId,
    slug: doc.slug,
    title: doc.title,
    company: doc.company,
    description: doc.description,
    period: doc.period,
    teamSize: doc.teamSize,
    technologies: (doc.technologies ?? []).map((t) => t.value),
    keyAchievement: doc.keyAchievement,
    featured: doc.featured ?? false,
    ...(links && (links.github || links.demo || links.paper)
      ? {
          links: {
            ...(links.github ? { github: links.github } : {}),
            ...(links.demo ? { demo: links.demo } : {}),
            ...(links.paper ? { paper: links.paper } : {}),
          },
        }
      : {}),
    ...(doc.markdownContent ? { markdownContent: doc.markdownContent } : {}),
    detail: transformDetail(doc.detail),
  };
}

export function transformCareer(doc: PayloadCareerDoc): CareerItem {
  return {
    period: doc.period,
    company: doc.company,
    role: doc.role,
    keywords: (doc.keywords ?? []).map((k) => k.value),
    ...(doc.current ? { current: doc.current } : {}),
  };
}

export function transformSkill(doc: PayloadSkillDoc): SkillGroup {
  return {
    label: doc.label,
    description: doc.description,
    items: (doc.items ?? []).map((i) => i.value),
  };
}

function transformEducation(doc: PayloadEducationDoc): Education {
  return {
    institution: doc.institution,
    degree: doc.degree,
    ...(doc.gpa ? { gpa: doc.gpa } : {}),
    period: doc.period,
  };
}

function transformCertification(doc: PayloadCertificationDoc): Certification {
  return {
    name: doc.name,
    date: doc.date,
    ...(doc.issuer ? { issuer: doc.issuer } : {}),
  };
}

function transformAward(doc: PayloadAwardDoc): Award {
  return {
    title: doc.title,
    date: doc.date,
    ...(doc.organizer ? { organizer: doc.organizer } : {}),
  };
}

function transformPublication(doc: PayloadPublicationDoc): Publication {
  return {
    title: doc.title,
    journal: doc.journal,
    year: doc.year,
    ...(doc.doi ? { doi: doc.doi } : {}),
  };
}

// ─── Dev Fallback Helper ────────────────────────────────────────

export async function withFallback<T>(
  payloadFn: () => Promise<T>,
  fallbackFn: () => T,
  label = "Payload fetch",
): Promise<T> {
  try {
    return await payloadFn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV !== "production") {
      if (!process.env.VITEST) {
        // eslint-disable-next-line no-console
        console.warn(`[${label}] DB connection failed, using static fallback:`, message);
      }
      return fallbackFn();
    }
    throw new Error(`[${label}] DB connection failed in production: ${message}`);
  }
}

// ─── Fetch Functions ────────────────────────────────────────────

export const fetchFeaturedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "projects",
          where: { featured: { equals: true } },
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformProject(doc as unknown as PayloadProjectDoc),
        );
      },
      () => staticGetFeatured(),
      "fetchFeaturedProjects",
    );
  },
  ["featured-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

export const fetchMoreProjects = unstable_cache(
  async (): Promise<Project[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "projects",
          where: { featured: { equals: false } },
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformProject(doc as unknown as PayloadProjectDoc),
        );
      },
      () => staticGetMore(),
      "fetchMoreProjects",
    );
  },
  ["more-projects"],
  { revalidate: 3600, tags: ["projects"] },
);

export const fetchProjectBySlug = unstable_cache(
  async (slug: string): Promise<Project | undefined> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "projects",
          where: { slug: { equals: slug } },
          limit: 1,
        });
        const doc = result.docs[0];
        if (!doc) return undefined;
        return transformProject(doc as unknown as PayloadProjectDoc);
      },
      () => staticGetBySlug(slug),
      "fetchProjectBySlug",
    );
  },
  // unstable_cache auto-appends function arguments (slug) to the key array
  ["project-by-slug"],
  { revalidate: 3600, tags: ["projects"] },
);

export const fetchAllProjectSlugs = unstable_cache(
  async (): Promise<string[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "projects",
          pagination: false,
          sort: "slug",
        });
        return result.docs.map(
          (doc) => (doc as unknown as PayloadProjectDoc).slug,
        );
      },
      () => staticProjects.map((p) => p.slug),
      "fetchAllProjectSlugs",
    );
  },
  ["all-project-slugs"],
  { revalidate: 3600, tags: ["projects"] },
);

export const fetchCareerHistory = unstable_cache(
  async (): Promise<CareerItem[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "career",
          sort: "sortOrder",
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformCareer(doc as unknown as PayloadCareerDoc),
        );
      },
      () => staticCareer,
      "fetchCareerHistory",
    );
  },
  ["career-history"],
  { revalidate: 3600, tags: ["career"] },
);

export const fetchSkillGroups = unstable_cache(
  async (): Promise<SkillGroup[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "skills",
          sort: "sortOrder",
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformSkill(doc as unknown as PayloadSkillDoc),
        );
      },
      () => staticSkills,
      "fetchSkillGroups",
    );
  },
  ["skill-groups"],
  { revalidate: 3600, tags: ["skills"] },
);

export const fetchEducation = unstable_cache(
  async (): Promise<Education[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "education",
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformEducation(doc as unknown as PayloadEducationDoc),
        );
      },
      () => staticEducation,
      "fetchEducation",
    );
  },
  ["education"],
  { revalidate: 3600, tags: ["education"] },
);

export const fetchCertifications = unstable_cache(
  async (): Promise<Certification[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "certifications",
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformCertification(doc as unknown as PayloadCertificationDoc),
        );
      },
      () => staticCertifications,
      "fetchCertifications",
    );
  },
  ["certifications"],
  { revalidate: 3600, tags: ["certifications"] },
);

export const fetchAwards = unstable_cache(
  async (): Promise<Award[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "awards",
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformAward(doc as unknown as PayloadAwardDoc),
        );
      },
      () => staticAwards,
      "fetchAwards",
    );
  },
  ["awards"],
  { revalidate: 3600, tags: ["awards"] },
);

export const fetchPublications = unstable_cache(
  async (): Promise<Publication[]> => {
    return withFallback(
      async () => {
        const payload = await getPayload({ config });
        const result = await payload.find({
          collection: "publications",
          limit: 100,
        });
        return result.docs.map((doc) =>
          transformPublication(doc as unknown as PayloadPublicationDoc),
        );
      },
      () => staticPublications,
      "fetchPublications",
    );
  },
  ["publications"],
  { revalidate: 3600, tags: ["publications"] },
);

import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Users } from '../collections/Users.ts'
import { Projects } from '../collections/Projects.ts'
import { Career } from '../collections/Career.ts'
import { Skills } from '../collections/Skills.ts'
import { Education } from '../collections/Education.ts'
import { Awards } from '../collections/Awards.ts'
import { Publications } from '../collections/Publications.ts'
import { Certifications } from '../collections/Certifications.ts'

import { projects } from '../data/_static/projects.ts'
import { loadMarkdownFromFile } from '../lib/markdown-cleanup.ts'
import { careerHistory } from '../data/_static/career.ts'
import { skillGroups } from '../data/_static/skills.ts'
import { education, certifications } from '../data/_static/education.ts'
import { awards, publications } from '../data/_static/awards.ts'

import type { Payload, Where } from 'payload'
import type { DetailSection, ProjectDetail } from '../data/projects.ts'

interface PayloadTableHeaders {
  col0: string
  col1: string
}

interface PayloadSection {
  title: string
  content?: string
  image?: { src?: string; alt?: string; caption?: string }
  imagePosition?: 'before' | 'after'
  tableHeaders?: PayloadTableHeaders
  table?: { label: string; value: string }[]
  subsections?: { title: string; content: string }[]
}

interface PayloadDetail {
  problem?: string
  role?: string
  architecture?: string
  implementation?: string
  impact?: string
  learnings?: string
  architectureImage?: { src?: string; alt?: string; caption?: string }
  demoImages?: { src: string; alt: string; caption?: string }[]
  sections?: PayloadSection[]
}

type SeedClient = Pick<Payload, 'create' | 'find'>

const ADMIN_USER = {
  email: process.env.PAYLOAD_ADMIN_EMAIL ?? 'admin@example.com',
  password: process.env.PAYLOAD_ADMIN_PASSWORD ?? 'changeme123',
  name: 'Admin',
} as const

if (process.env.NODE_ENV === 'production' && !process.env.PAYLOAD_ADMIN_PASSWORD) {
  throw new Error('PAYLOAD_ADMIN_PASSWORD must be set in production')
}

function transformSection(section: DetailSection): PayloadSection {
  const { tableHeaders, ...rest } = section
  return {
    ...rest,
    ...(tableHeaders ? { tableHeaders: { col0: tableHeaders[0], col1: tableHeaders[1] } } : {}),
  }
}

function transformDetail(detail: ProjectDetail): PayloadDetail {
  const { sections, ...rest } = detail
  return {
    ...rest,
    ...(sections ? { sections: sections.map(transformSection) } : {}),
  }
}

async function seedCollection<T>(
  payload: SeedClient,
  collectionSlug: string,
  label: string,
  items: T[],
  findWhere: (item: T) => Where,
  toLabel: (item: T) => string,
  toData: (item: T, index: number) => Promise<Record<string, unknown>> | Record<string, unknown>,
): Promise<void> {
  console.log(`--- Seeding ${label} ---`)
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const existing = await payload.find({
      collection: collectionSlug as 'users',
      where: findWhere(item),
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${toLabel(item)}`)
      continue
    }
    const data = await toData(item, i)
    await payload.create({
      collection: collectionSlug as 'users',
      data,
    })
    console.log(`  created: ${toLabel(item)}`)
  }
}

export async function ensureAdminUser(payload: SeedClient) {
  console.log('--- Seeding Users ---')

  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_USER.email } },
    limit: 1,
  })

  if (existingAdmin.totalDocs > 0) {
    console.log('  skip: admin user already exists')
    return
  }

  await payload.create({
    collection: 'users',
    data: ADMIN_USER,
  })
  console.log('  created: Admin user')
}

export async function seed(payloadClient: SeedClient) {
  const payload = payloadClient

  await ensureAdminUser(payload)

  await seedCollection(
    payload, 'projects', 'Projects', projects,
    (p) => ({ projectId: { equals: p.id } }),
    (p) => p.title,
    async (p) => {
      const markdownContent = p.markdownPath
        ? await loadMarkdownFromFile(p.markdownPath, p.imageMap)
        : null
      return {
        projectId: p.id,
        title: p.title,
        slug: p.slug,
        company: p.company,
        description: p.description,
        period: p.period,
        teamSize: p.teamSize,
        keyAchievement: p.keyAchievement,
        featured: p.featured,
        technologies: p.technologies.map((t) => ({ value: t })),
        links: p.links ?? {},
        detail: p.detail ? transformDetail(p.detail) : {},
        ...(markdownContent ? { markdownContent } : {}),
      }
    },
  )

  await seedCollection(
    payload, 'career', 'Career', careerHistory,
    (item) => ({
      and: [
        { company: { equals: item.company } },
        { role: { equals: item.role } },
        { period: { equals: item.period } },
      ] as Where[],
    }),
    (item) => `${item.company} - ${item.role}`,
    (item, i) => ({
      period: item.period,
      company: item.company,
      role: item.role,
      current: item.current ?? false,
      sortOrder: i,
      keywords: item.keywords.map((k) => ({ value: k })),
    }),
  )

  await seedCollection(
    payload, 'skills', 'Skills', skillGroups,
    (g) => ({ label: { equals: g.label } }),
    (g) => g.label,
    (g, i) => ({
      label: g.label,
      description: g.description,
      sortOrder: i,
      items: g.items.map((v) => ({ value: v })),
    }),
  )

  await seedCollection(
    payload, 'education', 'Education', education,
    (edu) => ({
      and: [
        { institution: { equals: edu.institution } },
        { degree: { equals: edu.degree } },
      ] as Where[],
    }),
    (edu) => edu.institution,
    (edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      gpa: edu.gpa,
      period: edu.period,
    }),
  )

  await seedCollection(
    payload, 'certifications', 'Certifications', certifications,
    (cert) => ({ name: { equals: cert.name } }),
    (cert) => cert.name,
    (cert) => ({
      name: cert.name,
      date: cert.date,
      issuer: cert.issuer,
    }),
  )

  await seedCollection(
    payload, 'awards', 'Awards', awards,
    (a) => ({ title: { equals: a.title } }),
    (a) => a.title,
    (a) => ({
      title: a.title,
      date: a.date,
      organizer: a.organizer,
    }),
  )

  await seedCollection(
    payload, 'publications', 'Publications', publications,
    (pub) => ({ title: { equals: pub.title } }),
    (pub) => pub.title,
    (pub) => ({
      title: pub.title,
      journal: pub.journal,
      year: pub.year,
      doi: pub.doi ?? undefined,
    }),
  )

  console.log('--- Seed complete ---')
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  const payloadSecret = process.env.PAYLOAD_SECRET

  if (!databaseUrl || !payloadSecret) {
    console.error('Missing DATABASE_URL or PAYLOAD_SECRET')
    process.exit(1)
  }

  // Strip hooks from collections to avoid Next.js runtime dependencies (e.g. revalidateTag)
  const stripHooks = (col: typeof Projects) => {
    const { hooks, ...rest } = col
    return rest
  }

  const config = buildConfig({
    editor: lexicalEditor(),
    collections: [Users, Projects, Career, Skills, Education, Awards, Publications, Certifications].map(stripHooks),
    secret: payloadSecret,
    db: postgresAdapter({ pool: { connectionString: databaseUrl } }),
  })

  const payload = await getPayload({ config })
  await seed(payload)
  process.exit(0)
}

if (process.env.VITEST === undefined) {
  main().catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
}

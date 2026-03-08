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
import { careerHistory } from '../data/_static/career.ts'
import { skillGroups } from '../data/_static/skills.ts'
import { education, certifications } from '../data/_static/education.ts'
import { awards, publications } from '../data/_static/awards.ts'

import type { Payload } from 'payload'
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

  const result: PayloadSection = { ...rest }

  if (tableHeaders) {
    result.tableHeaders = {
      col0: tableHeaders[0],
      col1: tableHeaders[1],
    }
  }

  return result
}

function transformDetail(detail: ProjectDetail): PayloadDetail {
  const { sections, ...rest } = detail

  const result: PayloadDetail = { ...rest }

  if (sections) {
    result.sections = sections.map(transformSection)
  }

  return result
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

  console.log('--- Seeding Projects ---')
  for (const project of projects) {
    const existing = await payload.find({
      collection: 'projects',
      where: { projectId: { equals: project.id } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${project.title}`)
      continue
    }
    await payload.create({
      collection: 'projects',
      data: {
        projectId: project.id,
        title: project.title,
        slug: project.slug,
        company: project.company,
        description: project.description,
        period: project.period,
        teamSize: project.teamSize,
        keyAchievement: project.keyAchievement,
        featured: project.featured,
        technologies: project.technologies.map((t) => ({ value: t })),
        links: project.links ?? {},
        detail: project.detail ? transformDetail(project.detail) : {},
      },
    })
    console.log(`  created: ${project.title}`)
  }

  console.log('--- Seeding Career ---')
  for (let i = 0; i < careerHistory.length; i++) {
    const item = careerHistory[i]
    const existing = await payload.find({
      collection: 'career',
      where: {
        and: [
          { company: { equals: item.company } },
          { role: { equals: item.role } },
          { period: { equals: item.period } },
        ],
      },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${item.company} - ${item.role}`)
      continue
    }
    await payload.create({
      collection: 'career',
      data: {
        period: item.period,
        company: item.company,
        role: item.role,
        current: item.current ?? false,
        sortOrder: i,
        keywords: item.keywords.map((k) => ({ value: k })),
      },
    })
    console.log(`  created: ${item.company} - ${item.role}`)
  }

  console.log('--- Seeding Skills ---')
  for (let i = 0; i < skillGroups.length; i++) {
    const group = skillGroups[i]
    const existing = await payload.find({
      collection: 'skills',
      where: { label: { equals: group.label } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${group.label}`)
      continue
    }
    await payload.create({
      collection: 'skills',
      data: {
        label: group.label,
        description: group.description,
        sortOrder: i,
        items: group.items.map((v) => ({ value: v })),
      },
    })
    console.log(`  created: ${group.label}`)
  }

  console.log('--- Seeding Education ---')
  for (const edu of education) {
    const existing = await payload.find({
      collection: 'education',
      where: {
        and: [
          { institution: { equals: edu.institution } },
          { degree: { equals: edu.degree } },
        ],
      },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${edu.institution}`)
      continue
    }
    await payload.create({
      collection: 'education',
      data: {
        institution: edu.institution,
        degree: edu.degree,
        gpa: edu.gpa,
        period: edu.period,
      },
    })
    console.log(`  created: ${edu.institution}`)
  }

  console.log('--- Seeding Certifications ---')
  for (const cert of certifications) {
    const existing = await payload.find({
      collection: 'certifications',
      where: { name: { equals: cert.name } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${cert.name}`)
      continue
    }
    await payload.create({
      collection: 'certifications',
      data: {
        name: cert.name,
        date: cert.date,
        issuer: cert.issuer,
      },
    })
    console.log(`  created: ${cert.name}`)
  }

  console.log('--- Seeding Awards ---')
  for (const award of awards) {
    const existing = await payload.find({
      collection: 'awards',
      where: { title: { equals: award.title } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${award.title}`)
      continue
    }
    await payload.create({
      collection: 'awards',
      data: {
        title: award.title,
        date: award.date,
        organizer: award.organizer,
      },
    })
    console.log(`  created: ${award.title}`)
  }

  console.log('--- Seeding Publications ---')
  for (const pub of publications) {
    const existing = await payload.find({
      collection: 'publications',
      where: { title: { equals: pub.title } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`  skip: ${pub.title}`)
      continue
    }
    await payload.create({
      collection: 'publications',
      data: {
        title: pub.title,
        journal: pub.journal,
        year: pub.year,
        doi: pub.doi ?? undefined,
      },
    })
    console.log(`  created: ${pub.title}`)
  }

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

# Full-Stack Portfolio Transition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **REQUIRED POST-TASK SKILL:** After completing each task, use plan-evolution to review and update this plan before starting the next task.

**Goal:** Convert the static Next.js portfolio into a full-stack application with Payload CMS, Supabase DB, Python LangGraph chatbot, and streaming chat UI.

**Architecture:** Payload CMS 3.0 embeds directly into the existing Next.js `/app` folder, providing an admin panel and REST API backed by Supabase PostgreSQL. A separate Python FastAPI service runs a LangGraph agent with RAG (pgvector) and Claude API for the AI chatbot. Next.js proxies chat requests to the Python backend via SSE streaming.

**Tech Stack:** Next.js 15 + Payload CMS 3.0 + Supabase (PostgreSQL + pgvector) + Python FastAPI + LangGraph + Claude API (Anthropic) + OpenAI Embeddings

**Deployment:** Next.js → Vercel, Python FastAPI → Render / Railway / Fly.io (비교 후 결정)

---

## Structure: Part A / Part B

이 계획은 두 개의 독립적 파트로 나뉩니다:

| Part | Scope | Phases | Tasks |
|------|-------|--------|-------|
| **Part A: CMS 전환** | Payload CMS + Supabase DB로 정적 데이터 마이그레이션 | Phase 1-2 | 1-24 |
| **Part B: AI 챗봇** | Python LangGraph 챗봇 백엔드 + 프론트엔드 통합 + 배포 | Phase 3-5 | 25-51 |

**Gate:** Part B는 Part A가 완료되고 프로덕션에서 안정적으로 동작하는 것이 확인된 후에 별도 착수합니다. Part A 완료 기준:
- 모든 Phase 1-2 태스크 완료
- `npm run build` 성공, `npm run test:run` 통과
- Vercel 배포 후 CMS 데이터로 정상 렌더링 확인
- 최소 1주간 프로덕션 안정성 확인

---

## Context

The portfolio currently uses hardcoded TypeScript data files (`data/*.ts`) imported directly by components. The user wants to:
1. Manage content via CMS admin panel instead of code changes
2. Add a database backend (Supabase PostgreSQL)
3. Build an AI chatbot where visitors can ask about the portfolio
4. Use Python LangGraph for custom agent orchestration logic
5. Use Claude API (Anthropic) for LLM inference

---

## Part A: CMS 전환

## Phase 1: Payload CMS Integration (Tasks 1-20)

### Task 1: Environment variables setup
**Files:** Create `.env.example`, `.env`

```bash
# .env.example
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
PAYLOAD_SECRET=your-payload-secret-min-32-chars
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# CHATBOT_API_URL=http://localhost:8000
# ANTHROPIC_API_KEY=sk-ant-placeholder
# OPENAI_API_KEY=sk-placeholder
```

**Note:** LLM 추론은 `ANTHROPIC_API_KEY` (Claude), 임베딩은 `OPENAI_API_KEY` (`text-embedding-3-small`) 사용. 실제 키는 사용자가 직접 입력.

**Commit:** `chore: add environment variable template`

---

### Task 2: Install Payload CMS dependencies

```bash
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical
```

**Commit:** `chore: install Payload CMS 3.0 with postgres adapter`

---

### Task 3: PoC verification — Payload + React 19 호환성 검증

**Goal:** Payload CMS가 현재 프로젝트 스택(React 19 + Next.js 15)에서 안정적으로 동작하는지 사전 검증. 본격적인 컬렉션 구축 전에 리스크를 조기 발견한다.

**검증 항목:**
1. **중첩 array field 동작 확인:** Projects 스키마와 유사한 3단계 중첩 구조 (`array > group > array`) 를 테스트 컬렉션으로 생성, admin UI에서 CRUD 동작 확인
2. **React 19 호환성:** React 19.2.3+ / Next.js 15.4.10+ 보안 패치 적용 확인. `npm ls react` 로 버전 충돌 없는지 검증
3. **DB 연결:** Supabase PostgreSQL 연결 후 Payload auto-migration 정상 동작 확인

**검증 실패 시 대안:**
- 중첩 array 불안정 → 스키마 단순화 (group 대신 JSON 필드 사용)
- React 19 충돌 → Payload 버전 고정 (호환되는 마지막 버전으로 pinning)
- DB 연결 실패 → connection string 형식 및 Supabase 네트워크 설정 점검

**Note:** 이 태스크는 실패해도 되는 검증 단계. 성공 시 테스트 컬렉션을 제거하고 진행, 실패 시 대안 적용 후 진행.

**Commit:** `chore: verify Payload CMS + React 19 compatibility (PoC)`

---

### Task 4: Create Payload configuration

**Files:** Create `payload.config.ts`

- Configure `postgresAdapter` with `DATABASE_URL`
- Configure `lexicalEditor`
- Register all collections (Users, Projects, Career, Skills, Education, Awards, Publications, Certifications)
- Add `@payload-config` path alias to `tsconfig.json`

**Commit:** `feat: add Payload CMS configuration with postgres adapter`

---

### Task 5: Create Users collection

**Files:** Create `collections/Users.ts`

```typescript
{
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text', required: true },
  ],
}
```

**Commit:** `feat: add Payload Users collection with auth`

---

### Task 6: Create Projects collection

**Files:** Create `collections/Projects.ts`

**Critical:** 가장 복잡한 컬렉션. 3단계 중첩 구조를 정확히 표현해야 함.

기존 인터페이스 매핑: `Project` + `ProjectDetail` + `DetailSection` (from `data/projects.ts`)

```typescript
{
  slug: 'projects',
  admin: { useAsTitle: 'title' },
  fields: [
    // ── Project 최상위 필드 ──
    { name: 'projectId',      type: 'text',     required: true, unique: true, index: true,
      admin: { description: '기존 data/projects.ts의 Project.id 문자열 보존용' },
    },
    { name: 'title',          type: 'text',     required: true },
    { name: 'slug',           type: 'text',     required: true, unique: true },
    { name: 'company',        type: 'text',     required: true },
    { name: 'description',    type: 'textarea', required: true },
    { name: 'period',         type: 'text',     required: true },
    { name: 'teamSize',       type: 'text',     required: true },
    { name: 'keyAchievement', type: 'text',     required: true },
    { name: 'featured',       type: 'checkbox', defaultValue: false },
    { name: 'technologies',   type: 'array',    fields: [
      { name: 'value', type: 'text', required: true },
    ]},

    // ── links (group) ──
    { name: 'links', type: 'group', fields: [
      { name: 'github', type: 'text' },
      { name: 'demo',   type: 'text' },
      { name: 'paper',  type: 'text' },
    ]},

    // ── detail (group) → ProjectDetail ──
    { name: 'detail', type: 'group', fields: [
      { name: 'problem',        type: 'textarea' },
      { name: 'role',           type: 'textarea' },
      { name: 'architecture',   type: 'textarea' },
      { name: 'implementation', type: 'textarea' },
      { name: 'impact',         type: 'textarea' },
      { name: 'learnings',      type: 'textarea' },

      // architectureImage (group)
      { name: 'architectureImage', type: 'group', fields: [
        { name: 'src',     type: 'text' },
        { name: 'alt',     type: 'text' },
        { name: 'caption', type: 'text' },
      ]},

      // demoImages[] (array of image objects)
      { name: 'demoImages', type: 'array', fields: [
        { name: 'src',     type: 'text', required: true },
        { name: 'alt',     type: 'text', required: true },
        { name: 'caption', type: 'text' },
      ]},

      // sections[] → DetailSection (3단계 중첩의 핵심)
      { name: 'sections', type: 'array', fields: [
        { name: 'title',         type: 'text', required: true },
        { name: 'content',       type: 'textarea' },

        // section.image (group)
        { name: 'image', type: 'group', fields: [
          { name: 'src',     type: 'text' },
          { name: 'alt',     type: 'text' },
          { name: 'caption', type: 'text' },
        ]},
        { name: 'imagePosition', type: 'select', options: [
          { label: 'Before', value: 'before' },
          { label: 'After',  value: 'after' },
        ]},

        // section.tableHeaders (group — 2-element tuple)
        // 제약: col0/col1은 반드시 함께 입력 (구현 시 field-level validate 추가)
        { name: 'tableHeaders', type: 'group', fields: [
          { name: 'col0', type: 'text' },
          { name: 'col1', type: 'text' },
        ]},

        // section.table[] (array)
        { name: 'table', type: 'array', fields: [
          { name: 'label', type: 'text', required: true },
          { name: 'value', type: 'text', required: true },
        ]},

        // section.subsections[] (array — 3단계 중첩)
        { name: 'subsections', type: 'array', fields: [
          { name: 'title',   type: 'text',     required: true },
          { name: 'content', type: 'textarea', required: true },
        ]},
      ]},
    ]},
  ],
}
```

**ID strategy (required):** Payload 내부 `id`는 내부 식별자로만 사용하고, 기존 `Project.id` 문자열 호환을 위해 `projectId` 필드를 별도로 유지한다.

**Note:** `tableHeaders`는 기존 인터페이스에서 `[string, string]` 튜플이지만, Payload에는 tuple 타입이 없으므로 `group { col0, col1 }`로 표현. 검증 규칙으로 `col0/col1` 동시 입력을 강제하고, `lib/payload.ts` 변환 시 `[col0, col1]` 배열로 매핑한다.

**Commit:** `feat: add Payload Projects collection matching existing data schema`

---

### Task 7: Create Career collection

**Files:** Create `collections/Career.ts`

기존 인터페이스 매핑: `CareerItem` (from `data/career.ts`)

```typescript
{
  slug: 'career',
  admin: { useAsTitle: 'company', defaultColumns: ['company', 'role', 'period', 'sortOrder'] },
  fields: [
    { name: 'period',    type: 'text',     required: true },
    { name: 'company',   type: 'text',     required: true },
    { name: 'role',      type: 'text',     required: true },
    { name: 'current',   type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number',   defaultValue: 0,
      admin: { position: 'sidebar', description: 'Admin 정렬용 (프론트에 노출 안 됨)' },
    },
    { name: 'keywords',  type: 'array', fields: [
      { name: 'value', type: 'text', required: true },
    ]},
  ],
}
```

**Transform:** `lib/payload.ts`에서 `sortOrder`, `id`, `createdAt`, `updatedAt` 제거 → `CareerItem` 인터페이스로 변환.

**Commit:** `feat: add Payload Career collection`

---

### Task 8: Create Skills collection

**Files:** Create `collections/Skills.ts`

기존 인터페이스 매핑: `SkillGroup` (from `data/skills.ts`)

```typescript
{
  slug: 'skills',
  admin: { useAsTitle: 'label', defaultColumns: ['label', 'description', 'sortOrder'] },
  fields: [
    { name: 'label',       type: 'text', required: true },
    { name: 'description', type: 'text', required: true },
    { name: 'sortOrder',   type: 'number', defaultValue: 0,
      admin: { position: 'sidebar', description: 'Admin 정렬용 (프론트에 노출 안 됨)' },
    },
    { name: 'items', type: 'array', fields: [
      { name: 'value', type: 'text', required: true },
    ]},
  ],
}
```

**Transform:** `lib/payload.ts`에서 `items` 배열을 `string[]`로 평탄화 (`[{value: 'Python'}, ...] → ['Python', ...]`), `sortOrder` 제거.

**Commit:** `feat: add Payload Skills collection`

---

### Task 9: Create remaining collections (Education, Awards, Publications, Certifications)

**Files:** Create `collections/Education.ts`, `collections/Awards.ts`, `collections/Publications.ts`, `collections/Certifications.ts`

기존 인터페이스 매핑: `Education`, `Certification` (from `data/education.ts`), `Award`, `Publication` (from `data/awards.ts`)

```typescript
// collections/Education.ts
{
  slug: 'education',
  admin: { useAsTitle: 'institution' },
  fields: [
    { name: 'institution', type: 'text', required: true },
    { name: 'degree',      type: 'text', required: true },
    { name: 'gpa',         type: 'text' },
    { name: 'period',      type: 'text', required: true },
  ],
}

// collections/Certifications.ts
{
  slug: 'certifications',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name',   type: 'text', required: true },
    { name: 'date',   type: 'text', required: true },
    { name: 'issuer', type: 'text' },
  ],
}

// collections/Awards.ts
{
  slug: 'awards',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title',     type: 'text', required: true },
    { name: 'date',      type: 'text', required: true },
    { name: 'organizer', type: 'text' },
  ],
}

// collections/Publications.ts
{
  slug: 'publications',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title',   type: 'text',   required: true },
    { name: 'journal', type: 'text',   required: true },
    { name: 'year',    type: 'number', required: true },
    { name: 'doi',     type: 'text' },
  ],
}
```

**Commit:** `feat: add Education, Awards, Publications, Certifications collections`

---

### Task 10: Set up Payload admin routes in Next.js app

**Files:** Create:
- `app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin page
- `app/(payload)/admin/[[...segments]]/not-found.tsx` — Payload 404
- `app/(payload)/layout.tsx` — Payload layout with CSS import
- `app/(payload)/api/[...slug]/route.ts` — REST API routes (GET/POST/PATCH/PUT/DELETE)

**Modify:** `next.config.ts` — wrap with `withPayload()`

Run `npx payload generate:importmap` after creation.

**Commit:** `feat: add Payload admin panel routes and API endpoints`

---

### Task 11: Set up Supabase project (manual)

1. Create Supabase project at https://supabase.com
2. Copy PostgreSQL connection string → `.env` `DATABASE_URL`
3. Enable pgvector: `CREATE EXTENSION IF NOT EXISTS vector;`
4. Start dev server → navigate to `/admin` → register admin user

**Verify:** Payload auto-creates tables, admin registration screen appears.

---

### Task 12: Create data access layer (`lib/payload.ts`)

**Files:** Create `lib/payload.ts`, `__tests__/lib/payload.test.ts`

**TDD approach:**
1. Write test asserting all fetch functions exist
2. Implement functions using Payload Local API
3. Each function transforms Payload documents → existing TypeScript interfaces

Exported functions:
- `fetchFeaturedProjects()` → `Project[]`
- `fetchMoreProjects()` → `Project[]`
- `fetchProjectBySlug(slug)` → `Project | undefined`
- `fetchAllProjectSlugs()` → `string[]`
- `fetchCareerHistory()` → `CareerItem[]`
- `fetchSkillGroups()` → `SkillGroup[]`
- `fetchEducation()` → `Education[]`
- `fetchCertifications()` → `Certification[]`
- `fetchAwards()` → `Award[]`
- `fetchPublications()` → `Publication[]`

**Key pattern:** The `data/*.ts` type interfaces remain canonical. `lib/payload.ts` imports types from `@/data` and transforms Payload docs to match. Payload-internal fields (`id`, `sortOrder`, `createdAt`, `updatedAt`)는 변환 시 제거.

**Project transform contract (must):**
- `Project.id` ← `projects.projectId` (Payload 내부 `id`가 아님)
- `technologies: Array<{ value: string }>` → `string[]`
- `detail.sections[].tableHeaders: { col0?: string; col1?: string }` → `[string, string] | undefined` (`col0/col1` 둘 다 있을 때만 매핑)
- 중첩 array (`demoImages`, `sections`, `table`, `subsections`)의 내부 식별자/정렬 메타 필드는 제거 후 기존 인터페이스 형태로 매핑

**Dev fallback 전략:** `NODE_ENV=development`에서 DB 연결 실패 시 `data/_static/*.ts`의 정적 데이터를 fallback으로 반환. 단순 빈 배열이 아닌, 실제 포트폴리오 데이터가 보이는 개발 환경을 유지한다.

**Note:** 초기 구현 시에는 `data/*.ts`에서 직접 import. Task 20에서 `data/_static/`으로 이관 후 import 경로 업데이트.

```typescript
// fallback 패턴 예시 (Task 20 이후 최종 형태)
import { careerData } from '@/data/_static/career';

async function fetchWithFallback<T>(
  fetcher: () => Promise<T>,
  fallbackData: T,
  label: string
): Promise<T> {
  try {
    return await fetcher();
  } catch (err) {
    console.error(`[payload] ${label} fetch failed:`, err);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[payload] Using static fallback data for ${label}`);
      return fallbackData;
    }
    throw err; // prod에서는 Error Boundary로 전파
  }
}
```

**Caching strategy:** Next.js 15의 `unstable_cache`로 래핑하여 DB 호출을 최소화:
- `revalidate: 3600` (1시간) — 포트폴리오 데이터는 자주 변하지 않음
- Payload `afterChange` hook에서 `revalidateTag()` 호출로 즉시 무효화 (on-demand revalidation) → Task 13에서 구현
- 각 컬렉션별 cache tag 사용 (e.g., `'projects'`, `'career'`, `'skills'`)

```typescript
// 예시 패턴
import { unstable_cache } from 'next/cache';

export const fetchCareerHistory = unstable_cache(
  async (): Promise<CareerItem[]> => {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({ collection: 'career', sort: 'sortOrder' });
    return docs.map(transformToCareerItem); // sortOrder 제거
  },
  ['career'],
  { revalidate: 3600, tags: ['career'] }
);
```

**Note:** `unstable_cache`는 Next.js 15에서 아직 동작하지만 deprecated 방향. Next.js 16에서 `use cache` directive로 교체됨. 현재 Next.js 15.x에서는 그대로 진행하되, Next.js 16 업그레이드 시 마이그레이션 필요. 참고: https://nextjs.org/docs/app/api-reference/directives/use-cache

**Verify:** `npm run test:run` — payload.test.ts 통과. 모든 fetch 함수가 올바른 타입을 반환하는지 확인.

**Commit:** `feat: add Payload data access layer with typed fetch functions`

---

### Task 13: Add Payload `afterChange` hooks for cache revalidation

**Files:** Modify each collection file (Projects, Career, Skills, etc.)

Each collection에 `afterChange` hook 추가 → `revalidateTag(collectionSlug)` 호출. Admin에서 콘텐츠 수정 시 해당 컬렉션의 캐시가 즉시 무효화됨.

```typescript
// 예시: collections/Career.ts
import { revalidateTag } from 'next/cache';

hooks: {
  afterChange: [
    ({ collection }) => { revalidateTag(collection.slug); }
  ],
}
```

**Commit:** `feat: add afterChange hooks for on-demand cache revalidation`

---

> **이미지/미디어 전략 (Phase 1):**
> - Phase 1에서는 현재 `/public/projects/` 정적 이미지를 그대로 유지한다 (변경 없음).
> - `ProjectImage.src` 필드는 Payload에서 `text` 타입으로 유지하여 URL 경로(e.g., `/projects/project-a/demo.png`)를 저장한다.
> - 향후 Payload Media 컬렉션으로 이미지 업로드/관리를 마이그레이션하는 것은 별도 계획으로 분리한다. Part A에서는 이미지 관련 변경을 하지 않는다.

---

### Task 14: Create seed script

**Files:** Create `scripts/seed.ts`

- Import existing data from `data/*.ts`
- Use `getPayload()` to create documents in each collection
- For `projects`, map `data/projects.ts`의 `id` → Payload `projectId`로 저장 (기존 문자열 ID 보존)
- Install `tsx`: `npm install -D tsx`
- Add `"seed": "npx tsx scripts/seed.ts"` to package.json

**Run:** `npm run seed` → populates DB from static data

**Verify:** `npm run seed` 실행 후 `/admin` 패널에서 각 컬렉션에 데이터가 존재하는지 확인. 특히 Projects 컬렉션의 중첩 array (sections, demoImages) 데이터가 정상 표시되는지 검증.

**Commit:** `feat: add seed script to migrate static data into Payload CMS`

---

### Tasks 15-18: Update section components to fetch from Payload

For each section component:
1. Update test to mock `@/lib/payload` instead of `@/data/*`
2. Convert to `async` server component
3. Replace `import { data } from '@/data/*'` with `import { fetchX } from '@/lib/payload'`
4. Replace direct data reference with `await fetchX()`

| Task | Component | Data Source | Commit |
|------|-----------|------------|--------|
| 15 | `ProjectsSection.tsx` | `fetchFeaturedProjects`, `fetchMoreProjects` | `refactor: update ProjectsSection to fetch from Payload` |
| 16 | `CareerSection.tsx` | `fetchCareerHistory` | `refactor: update CareerSection to fetch from Payload` |
| 17 | `SkillsSection.tsx` | `fetchSkillGroups` | `refactor: update SkillsSection to fetch from Payload` |
| 18 | `CredentialsSection.tsx` | `fetchAwards`, `fetchPublications`, `fetchEducation`, `fetchCertifications` (via `Promise.all`) | `refactor: update CredentialsSection to fetch from Payload` |

**각 태스크 완료 후 Verify:** `npm run test:run` 해당 컴포넌트 테스트 통과 + `npm run dev`로 해당 섹션 렌더링 확인.

---

### Task 19: Update project detail page and sitemap

**Files:** Modify `app/projects/[slug]/page.tsx`, `app/sitemap.ts`

**Project detail page:**
- Replace `getProjectBySlug` → `fetchProjectBySlug` from `lib/payload`
- Replace `generateStaticParams` → use `fetchAllProjectSlugs`
- Keep type imports from `data/projects` (interfaces only)

**Sitemap (`app/sitemap.ts`):**
- 현재 `import { projects } from "@/data/projects"` 로 데이터 배열을 직접 참조 중
- `fetchAllProjectSlugs()` 또는 `fetchFeaturedProjects()` + `fetchMoreProjects()`로 교체
- sitemap은 빌드 시 실행되므로 Payload fetch가 실패하면 빌드 자체가 깨짐 — 이는 의도된 동작 (prod에서 stale sitemap 방지)

```typescript
// app/sitemap.ts 변환 후
import { fetchAllProjectSlugs } from '@/lib/payload';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchAllProjectSlugs();
  const projectUrls = slugs.map((slug) => ({
    url: `${siteUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  // ...
}
```

**Verify:** `grep -r "from.*@/data" app/ --include="*.ts" --include="*.tsx"` — type import만 남아야 함.

**Commit:** `refactor: update project detail page and sitemap to fetch from Payload`

---

### Task 20: Clean up `data/*.ts` files and verify full CMS migration

**Goal:** 모든 컴포넌트가 Payload에서 데이터를 가져오는 것을 확인하고, `data/*.ts` 파일을 타입 전용으로 정리한다.

**실행 순서 (반드시 이 순서를 따를 것):**

**Step 1: `data/_static/` 디렉토리로 데이터 배열 이동**

데이터 배열을 제거하기 전에, fallback과 seed script가 참조할 수 있는 별도 위치로 먼저 이동한다.

```
data/_static/
  ├── projects.ts   ← 기존 data/projects.ts에서 데이터 배열 + helper 이동
  ├── career.ts     ← careerData 배열
  ├── skills.ts     ← skillGroups 배열
  ├── education.ts  ← education, certifications 배열
  ├── awards.ts     ← awards, publications 배열
  └── index.ts      ← barrel re-export (데이터 배열만)
```

**Step 2: fallback + seed 참조 경로 업데이트**

- `lib/payload.ts`의 fallback import: `@/data/career` → `@/data/_static/career`
- `scripts/seed.ts`의 import: `@/data/projects` → `@/data/_static/projects`
- `npm run test:run` 으로 참조 경로 변경 후 정상 동작 확인

**Step 3: `data/*.ts`를 타입 전용으로 정리**

| File | 변경 | 설명 |
|------|------|------|
| `data/projects.ts` | 데이터 배열 export 제거, 타입/인터페이스 export만 유지 | `Project`, `ProjectDetail`, `DetailSection`, `ProjectImage` 타입 유지. `featuredProjects`, `moreProjects`, `allProjects` 배열 export 제거. `getProjectBySlug`, `getFeaturedProjects` 등 helper 함수 제거 (→ `lib/payload.ts`로 이관 완료) |
| `data/career.ts` | 데이터 배열 export 제거, 타입 export만 유지 | `CareerItem` 타입 유지, `careerData` 배열 export 제거 |
| `data/skills.ts` | 데이터 배열 export 제거, 타입 export만 유지 | `SkillGroup` 타입 유지, `skillGroups` 배열 export 제거 |
| `data/education.ts` | 데이터 배열 export 제거, 타입 export만 유지 | `Education`, `Certification` 타입 유지, 데이터 배열 제거 |
| `data/awards.ts` | 데이터 배열 export 제거, 타입 export만 유지 | `Award`, `Publication` 타입 유지, 데이터 배열 제거 |
| `data/index.ts` | barrel export를 타입 전용으로 변환 | `export type { ... } from './...'` 형태로 변경 |

**Step 4: 전체 검증**

```bash
# 1. 컴포넌트/페이지에서 데이터 배열 import가 남아있지 않은지 확인
grep -r "from.*@/data" components/ app/ --include="*.tsx" --include="*.ts"
# Expected: only type imports remain (e.g., import type { Project } from '@/data/projects')
# app/sitemap.ts도 Payload fetch로 전환되었는지 확인

# 2. _static 참조가 올바른 위치에만 있는지 확인
grep -r "from.*@/data/_static" . --include="*.ts" --include="*.tsx"
# Expected: lib/payload.ts (fallback)와 scripts/seed.ts에서만 참조

# 3. 빌드 + 테스트
npm run test:run   # all tests pass
npm run build      # build succeeds
```

**Commit:** `refactor: separate static data into _static dir, convert data files to type-only exports`

---

## Phase 2: Database Hardening (Tasks 21-24)

### Task 21: Enable Row Level Security on Supabase

SQL in Supabase editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Payload는 service_role key로 접속하므로 RLS를 bypass함.
-- 아래 정책은 defense-in-depth로, 만약 anon key가 노출되어도 쓰기 차단.

-- ── 공개 데이터 테이블 (projects, career, skills, education, awards, publications, certifications) ──
-- 패턴:
ALTER TABLE {public_table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON {public_table}
  FOR SELECT USING (true);

CREATE POLICY "Allow service_role write" ON {public_table}
  FOR ALL USING (auth.role() = 'service_role');

-- ── users 테이블 (인증 정보 포함 — 공개 읽기 금지) ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- users는 service_role만 접근 허용 (읽기 포함)
-- Payload auth 데이터(이메일, 해시된 비밀번호 등)가 노출되지 않도록 보호
CREATE POLICY "Allow service_role only" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- portfolio_embeddings (Phase 3에서 생성)에도 공개 데이터와 동일 패턴 적용
```

**Note:** `{public_table}`은 Payload가 자동 생성하는 테이블명으로 대체 (projects, career, skills 등). Task 11에서 테이블명 확인 후 적용. **`users` 테이블은 반드시 공개 읽기 대상에서 제외** — Payload auth 사용자 정보(이메일, 해시 등) 노출 방지.

---

### Task 22: Add connection error handling to `lib/payload.ts`

**Files:** Modify `lib/payload.ts`, create `__tests__/lib/payload-fallback.test.ts`

**Dev/Prod 분리 전략:**
- **Development** (`NODE_ENV !== 'production'`): try/catch → `console.warn` + `data/_static/*.ts`의 정적 데이터를 fallback으로 반환. 단순 빈 배열이 아닌, 실제 포트폴리오 데이터가 표시되어 DB 없이도 로컬 개발이 가능하다. CI는 프로덕션 동일 조건(CI 전용 DB)으로 실행하므로 fallback에 의존하지 않음.
- **Production** (`NODE_ENV === 'production'`): try/catch → `console.error` + 에러를 re-throw. Next.js Error Boundary가 에러 페이지 표시. 빈 포트폴리오가 조용히 노출되는 것을 방지.

**Note:** Task 12에서 구현한 `fetchWithFallback` 패턴을 여기서 테스트로 검증. fallback이 `data/_static/`의 정적 데이터를 반환하는 것을 확인.

**Verify:** DB 연결 없이 `NODE_ENV=development npm run dev` 실행 → 포트폴리오 페이지에 정적 데이터가 정상 표시되는지 확인.

**Commit:** `feat: add graceful fallback for Payload fetch on DB errors`

---

### Task 23: Add environment variable validation

**Files:** Create `lib/env.ts`

Validate `DATABASE_URL`, `PAYLOAD_SECRET` exist at startup.

**실행 위치 (검증이 무력화되지 않도록 강제 import):**
- `payload.config.ts` 최상단에 `import '@/lib/env'` 추가 — Payload 초기화 전에 검증 실행
- `lib/env.ts`는 import 시 즉시 실행되는 side-effect 모듈로 구현 (함수 호출 불필요)

```typescript
// lib/env.ts
function validateEnv() {
  const required = ['DATABASE_URL', 'PAYLOAD_SECRET'] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
validateEnv(); // import 시 즉시 실행
```

**Verify:** `.env`에서 `DATABASE_URL`을 제거 후 `npm run dev` 실행 → 즉시 에러 발생 확인.

**Commit:** `feat: add environment variable validation`

---

### Task 24: Add CI/CD pipeline (GitHub Actions)

**Files:** Create `.github/workflows/ci.yml`

**목적:** PR/push 시 기본 품질 검증을 자동화한다.

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
```

**CI 환경 DB 전략 (단일 정책):**
- CI는 **프로덕션과 동일 조건** (`NODE_ENV=production`)으로 빌드한다. 프로덕션에서 실패할 조건을 CI에서 우회하면 릴리즈 신뢰도가 떨어지므로 `NODE_ENV=test` 우회는 사용하지 않는다.
- **CI 전용 Supabase 프로젝트** (무료 티어)를 별도 생성하고 connection string을 GitHub Secrets(`DATABASE_URL`)에 등록
- CI 전용 DB에는 seed 데이터가 필요함 — CI 워크플로에 seed step 포함:

```yaml
      - run: npm run seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
```

**Note:** CI용 Supabase 무료 프로젝트는 Part A Task 11에서 본 프로젝트와 함께 생성. seed는 idempotent하게 구현 (이미 존재하는 데이터는 skip).

**Commit:** `ci: add GitHub Actions workflow for lint, test, and build`

---

## Part B: AI 챗봇

> **Gate:** Part A (Phase 1-2)가 완료되고 프로덕션에서 안정적으로 동작하는 것이 확인된 후에 착수합니다.

## Phase 3: Python LangGraph Chatbot Backend (Tasks 25-39)

### Task 25: Initialize Python project

**Files:** Create `folio_agent/` directory with:
- `pyproject.toml` (아래 의존성 목록), `src/__init__.py`, `tests/__init__.py`
- `.env.example` — `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL` 포함

**의존성 (pyproject.toml):**

```toml
[project]
dependencies = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.34",
  "langgraph>=0.4",
  "langchain-anthropic>=0.3",
  "langchain-community>=0.3",
  "anthropic>=0.43",
  "openai>=1.60",
  "psycopg[binary]>=3.2",
  "pgvector>=0.3",
  "sse-starlette>=2.2",
  "pydantic-settings>=2.7",
  "slowapi>=0.1.9",          # rate limiting (Task 36, 49)
]

[dependency-groups]
dev = [
  "pytest>=8.0",             # 단위/통합 테스트 (Task 32-35, 50)
  "pytest-asyncio>=0.24",    # async 테스트 지원
  "ruff>=0.9",               # linting (Task 39 CI)
  "httpx>=0.28",             # FastAPI TestClient용
  "respx>=0.22",             # HTTP mock (외부 API mock)
]
```

```bash
cd folio_agent && uv sync
```

**Verify:** `uv run python -c "import fastapi, langgraph, slowapi, anthropic; print('OK')"` — 런타임 의존성 확인. `uv run ruff --version && uv run pytest --version` — 개발 의존성 확인.

**Commit:** `feat: initialize Python folio_agent project`

---

### Task 26: Config module (`src/config.py`)

Pydantic Settings: `anthropic_api_key`, `openai_api_key`, `database_url`, `claude_model` (default: claude-sonnet-4-20250514), `embedding_model` (default: text-embedding-3-small), `embedding_dimensions` (default: 1536), `top_k`

**Embedding:** OpenAI `text-embedding-3-small` 사용 (별도 `OPENAI_API_KEY` 필요). LLM 추론은 Anthropic Claude, 임베딩은 OpenAI로 분리.

**Commit:** `feat: add Python config module`

---

### Task 27: Database module (`src/db.py`)

- `get_connection()` — psycopg + pgvector registration
- `setup_tables()` — CREATE TABLE `portfolio_embeddings` with vector(1536) column

**Commit:** `feat: add database module with pgvector table setup`

---

### Task 28: Content extraction (`src/embeddings/extract.py`)

Extract portfolio content from Supabase tables → `ContentChunk` dataclass (content, source_type, source_id, metadata)

Extractors: `extract_projects`, `extract_career`, `extract_all`

**Commit:** `feat: add content extraction for embeddings`

---

### Task 29: Vectorization (`src/embeddings/vectorize.py`)

- `create_embeddings()` — OpenAI SDK `client.embeddings.create(model="text-embedding-3-small", input=texts)` 사용. `OPENAI_API_KEY`로 호출.
- `store_embeddings()` — INSERT into portfolio_embeddings with pgvector (vector dimension: 1536)

**Commit:** `feat: add vectorization and storage`

---

### Task 30: Embedding CLI (`src/embeddings/cli.py`)

Pipeline: setup_tables → extract_all → create_embeddings → store_embeddings

**Commit:** `feat: add embedding pipeline CLI`

---

### Task 31: LangGraph state (`src/agent/state.py`)

```python
class AgentState(MessagesState):
    query_type: Literal["portfolio", "general", "off_topic"] | None
    retrieved_context: str
    source_documents: list[dict]
```

**Commit:** `feat: add LangGraph agent state`

---

### Task 32: Router node (`src/agent/nodes/router.py`)

Classifies queries: portfolio / general / off_topic using Claude API

**Unit test (동시 작성):** `tests/test_router.py` — 쿼리 분류 정확성 검증 (portfolio/general/off_topic 최소 3개 케이스). **Claude API 호출은 `respx`로 mock** — 고정된 응답을 반환하여 비결정적/비용 문제 방지.

**Commit:** `feat: add router node with unit tests`

---

### Task 33: RAG retrieval node (`src/agent/nodes/retriever.py`)

pgvector similarity search → returns context + source documents

**Unit test (동시 작성):** `tests/test_retriever.py` — 검색 결과 형식 검증. **DB 호출은 mock** — 고정된 벡터 검색 결과를 반환하여 DB 의존성 제거.

**Commit:** `feat: add RAG retrieval node with unit tests`

---

### Task 34: Generator node (`src/agent/nodes/generator.py`)

Context-aware prompts per query_type → Claude API response

**API 비용 보호:**
- `max_tokens` 제한 추가 (기본값: 1024). 비정상적으로 긴 응답 생성을 방지.
- 프롬프트에 간결한 응답을 유도하는 지침 포함

```python
response = client.messages.create(
    model=settings.claude_model,
    max_tokens=1024,  # 비용 보호
    messages=messages,
    system=system_prompt,
)
```

**Unit test (동시 작성):** `tests/test_generator.py` — 생성 응답 형식 및 max_tokens 설정 검증. **Claude API 호출은 `respx`로 mock** — 고정된 응답으로 비용/비결정성 제거.

**Commit:** `feat: add LLM generation node with cost protection and unit tests`

---

### Task 35: Assemble graph (`src/agent/graph.py`)

```
START → router → [portfolio: retrieve → generate, general/off_topic: generate] → END
```

InMemorySaver checkpointer for conversation memory.

**Unit test (동시 작성):** `tests/test_graph.py` — 그래프가 정상 컴파일되는지, 노드 연결이 올바른지 확인. 외부 API/DB 호출 없이 그래프 구조만 검증.

**Commit:** `feat: assemble LangGraph agent graph with unit tests`

---

### Task 36: FastAPI server (`src/api.py`)

Endpoints:
- `POST /api/chat` — synchronous response
- `POST /api/chat/stream` — SSE streaming
- `GET /api/health` — health check

CORS: allow `http://localhost:3000`

**일일 사용량 제한:**
- IP당 일일 50회 요청 제한 (비용 폭주 방지)
- `slowapi` 또는 인메모리 카운터로 구현
- 429 응답 시 남은 reset 시간 헤더 포함

```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat")
@limiter.limit("50/day")
async def chat(request: Request, body: ChatRequest):
    ...
```

**Commit:** `feat: add FastAPI server with streaming SSE and daily rate limit`

---

### Task 37: Dockerfile

Python 3.12-slim + UV for dependencies.

**Commit:** `feat: add Dockerfile for chatbot backend`

---

### Task 38: docker-compose for local dev

**Commit:** `feat: add docker-compose for local development`

---

### Task 39: Python CI pipeline (GitHub Actions)

**Files:** Create `.github/workflows/ci-python.yml`

```yaml
name: CI (Python)
on:
  push:
    branches: [master]
    paths: ['folio_agent/**']
  pull_request:
    branches: [master]
    paths: ['folio_agent/**']

jobs:
  check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: folio_agent
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v4
      - run: uv sync
      - run: uv run ruff check .
      - run: uv run pytest tests/ --ignore=tests/test_integration.py
```

**Commit:** `ci: add GitHub Actions workflow for Python folio_agent`

---

## Phase 4: Chatbot Frontend (Tasks 40-46)

### Task 40: API proxy route (`app/api/chat/route.ts`)

POST → proxy to Python backend `CHATBOT_API_URL/api/chat`

**보안:**
- **Origin allowlist 검증:** 단일 값 비교 대신 허용 도메인 목록으로 검증. Vercel 프리뷰 배포, 로컬 개발 등 멀티도메인 환경을 지원.
- **입력 길이 제한:** `body.message.length > 500` 시 400 반환. 과도한 토큰 소비 방지.
- **CSRF 방어:** Origin 헤더는 비브라우저 클라이언트에서 위조 가능. 추가로 커스텀 헤더(`X-Requested-With: XMLHttpRequest`) 검증을 포함하여 simple request를 차단 (CORS preflight 강제).

```typescript
// lib/chat-security.ts — 공통 보안 유틸
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,           // production
  'http://localhost:3000',                     // local dev
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),  // Vercel preview
].filter(Boolean);

export function validateChatRequest(request: Request) {
  // Origin allowlist
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { error: 'Forbidden', status: 403 };
  }

  // CSRF: custom header 검증 (브라우저 simple request 차단)
  if (request.headers.get('X-Requested-With') !== 'XMLHttpRequest') {
    return { error: 'Forbidden', status: 403 };
  }

  return null; // valid
}
```

**Commit:** `feat: add chat API proxy route with origin allowlist and CSRF protection`

---

### Task 41: Streaming proxy route (`app/api/chat/stream/route.ts`)

POST → proxy SSE stream from Python backend

**보안:** Task 40과 동일한 `validateChatRequest()` 유틸 사용 + 입력 길이 제한 적용.

**Commit:** `feat: add streaming SSE proxy route with origin validation`

---

### Task 42: `useChatbot` hook (`hooks/useChatbot.ts`)

React hook: messages state, streaming SSE consumption via ReadableStream, abort support

**서버 보안 계약 준수 (필수):**
Task 40-41에서 정의한 보안 요구사항에 맞춰 모든 요청에 필수 헤더를 포함해야 한다:

```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // CSRF 방어 — 없으면 403
  },
  body: JSON.stringify({ message }),
  signal: abortController.signal,
});
```

**에러 처리:**
- `403` → "요청이 차단되었습니다" (보안 검증 실패)
- `400` → "메시지가 너무 깁니다 (최대 500자)"
- `429` → "요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요."

**Commit:** `feat: add useChatbot hook with streaming`

---

### Task 43: ChatMessage component (`components/chat/ChatMessage.tsx`)

User/assistant message bubbles using existing design tokens.

**Commit:** `feat: add ChatMessage component`

---

### Task 44: ChatBot panel (`components/chat/ChatBot.tsx`)

Floating button (bottom-right) + sliding chat panel. Uses `useChatbot` hook + `ChatMessage` component.

**Commit:** `feat: add ChatBot floating widget`

---

### Task 45: Integrate into layout

**Files:** Modify `app/layout.tsx` — add `<ChatBot />` after `<main>`

**Commit:** `feat: integrate ChatBot into root layout`

---

### Task 46: Final environment config

Add `CHATBOT_API_URL` to `.env.example`, `.env`, `lib/env.ts`

**Commit:** `chore: add chatbot API URL to environment config`

---

## Phase 5: Deployment & Hardening (Tasks 47-51)

### Task 47: Deploy Python backend

**배포 플랫폼 비교:**

| 플랫폼 | 무료 티어 | 콜드스타트 | 장점 | 단점 |
|---------|----------|-----------|------|------|
| **Render** | 750시간/월 | **2-3분** (무활동 15분 후 슬립) | 설정 간편, Docker 지원 | 콜드스타트 매우 느림 |
| **Railway** | $5 크레딧/월 | **~5초** (항상 실행) | 빠른 응답, 좋은 DX | 무료 크레딧 소진 시 중단 |
| **Fly.io** | 3 shared VMs | **~10초** (scale-to-zero 시) | 글로벌 리전, 유연한 설정 | 설정 복잡도 높음 |

**권장:** Railway (응답 속도 우선) 또는 Render (비용 0원 우선). 사용자가 선택.

**Render 선택 시 콜드스타트 완화:**
- `aiocron` 또는 외부 cron 서비스(e.g., cron-job.org)로 14분 간격 self-ping: `GET /api/health`
- 프론트엔드 UX: 단순 "연결 중..." 대신 예상 대기 시간 표시 (e.g., "챗봇 서버를 깨우는 중입니다. 최대 2-3분 소요될 수 있습니다.")

**Render 배포 절차:**
1. Render 대시보드에서 "New Web Service" → GitHub repo 연결 (`folio_agent/` 디렉토리)
2. Build Command: `pip install uv && uv sync`
3. Start Command: `uv run uvicorn src.api:app --host 0.0.0.0 --port $PORT`
4. Environment variables 설정: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`
5. Free tier 선택

**Commit:** `docs: add deployment configuration`

---

### Task 48: Configure Vercel deployment for Next.js

1. Vercel 프로젝트 설정에서 환경변수 추가: `DATABASE_URL`, `PAYLOAD_SECRET`, `CHATBOT_API_URL` (배포 서비스 URL)
2. `CHATBOT_API_URL`을 배포 URL로 설정 (e.g., `https://folio-agent.onrender.com` 또는 Railway URL)

**Commit:** `docs: add Vercel deployment notes`

---

### Task 49: Add rate limiting to chatbot API

**Files:** Modify `folio_agent/src/api.py`

`slowapi` 또는 커스텀 미들웨어로 IP 기반 rate limit 추가:
- 분당 10회 요청 제한 (burst 방지)
- 일일 50회 제한은 Task 36에서 이미 구현
- 429 응답 시 프론트엔드에서 안내 메시지 표시

**Commit:** `feat: add rate limiting to chatbot API`

---

### Task 50: Python integration tests

**Files:** Create `folio_agent/tests/test_integration.py`

**Note:** 개별 노드 unit test는 Phase 3 (Tasks 32-35)에서 mock 기반으로 구현됨. 이 태스크는 실제 외부 서비스를 포함하는 전체 파이프라인 통합 테스트.

**테스트 전략 (단위 vs 통합 분리):**
- **단위 테스트** (Tasks 32-35, CI에서 항상 실행): mock 기반, 외부 의존성 없음, 빠르고 결정적
- **통합 테스트** (이 태스크, CI에서 **선택적/nightly 실행**): 실제 API + DB 필요, 비결정적 가능성 있음

통합 테스트 범위:
- 전체 그래프 실행: 메시지 입력 → router → retriever → generator → 응답 출력
- SSE 스트리밍 엔드투엔드 검증
- Rate limiting 동작 확인 (429 응답)
- Health check 엔드포인트 검증

**테스트 데이터:** 통합 테스트용 고정 입력/기대 출력 세트를 `tests/fixtures/` 에 관리. API 응답의 정확한 텍스트가 아닌 구조적 형식(필드 존재, 타입, 길이 범위)만 검증하여 비결정성 최소화.

```bash
# 단위 테스트 (CI 기본)
cd folio_agent && uv run pytest tests/ --ignore=tests/test_integration.py

# 통합 테스트 (수동/nightly)
cd folio_agent && uv run pytest tests/test_integration.py
```

**CI 설정 (ci-python.yml 수정):**
```yaml
      - run: uv run pytest tests/ --ignore=tests/test_integration.py  # 단위만
```

**Commit:** `test: add integration tests for agent pipeline`

---

### Task 51: Add environment variable validation for chatbot keys

**Files:** Modify `lib/env.ts`

Phase 4 환경변수 추가 검증: `CHATBOT_API_URL` 존재 확인. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`는 Python 서버 측에서 검증 (Task 26 config.py에서 이미 처리).

**Commit:** `feat: validate chatbot environment variables`

---

## Summary

| Part | Phase | Tasks | Description |
|------|-------|-------|-------------|
| **Part A** | **Phase 1** | 1-20 | Payload CMS: install, PoC verification, collections, admin panel, data access layer (with static data fallback), cache revalidation hooks, seed, component migration, data file cleanup |
| **Part A** | **Phase 2** | 21-24 | Database hardening: RLS, error handling, env validation, CI/CD pipeline |
| | | | **⏸ Gate: Part A 완료 및 프로덕션 안정화 확인 후 Part B 착수** |
| **Part B** | **Phase 3** | 25-39 | Python LangGraph: project setup, OpenAI embeddings pipeline, agent graph (router→retriever→generator) with unit tests, FastAPI with daily cap, Docker, Python CI |
| **Part B** | **Phase 4** | 40-46 | Frontend chatbot: API proxy (with origin validation + input limits), streaming, React hook, chat UI, layout integration |
| **Part B** | **Phase 5** | 47-51 | Deployment & hardening: platform deploy (Render/Railway), Vercel, rate limiting, integration tests, env validation |
| | **Total** | **51 tasks** | |

**Note:** HeroSection, AboutSection, ContactSection은 정적 콘텐츠이므로 CMS 마이그레이션 대상에서 의도적으로 제외. 추후 필요 시 Global로 추가 가능.

## Critical Files

| File | Role |
|------|------|
| `payload.config.ts` | Central CMS configuration wiring all collections and DB |
| `lib/payload.ts` | Data access abstraction — all components import from here, includes static data fallback |
| `collections/Projects.ts` | Most complex collection, must match existing nested interfaces |
| `folio_agent/src/agent/graph.py` | LangGraph agent assembly (router→retriever→generator) |
| `components/chat/ChatBot.tsx` | Floating chat widget with streaming UI |
| `scripts/seed.ts` | Migration of existing static data to CMS database |
| `.github/workflows/ci.yml` | CI pipeline for Next.js (lint + test + build) |

## Verification

### Phase 1 complete:
```bash
npm run seed          # seed data into Supabase
npm run dev           # start dev server
# Visit http://localhost:3000/admin → login → verify all collections have data
# Visit http://localhost:3000 → verify portfolio renders from DB data
npm run test:run      # all tests pass
npm run build         # production build succeeds
```

### Phase 2 complete:
```bash
# Supabase SQL editor에서 RLS 정책 확인
# anon key로 INSERT 시도 → 차단됨을 확인
# anon key로 users 테이블 SELECT 시도 → 차단됨을 확인 (인증 데이터 보호)
# anon key로 projects 테이블 SELECT 시도 → 허용됨을 확인 (공개 데이터)
npm run test:run      # fallback 테스트 통과 (data/_static/ 정적 데이터 반환 확인)
npm run build         # env validation 포함 빌드 성공
# GitHub Actions CI 파이프라인 동작 확인 (CI 전용 DB + seed)
```

### Part A Gate 확인:
```bash
# Vercel 프로덕션 배포 후:
# - CMS 데이터로 정상 렌더링 확인
# - /admin 패널 접근 및 콘텐츠 편집 → 사이트 반영 확인
# - 최소 1주간 에러 모니터링
```

### Phase 3 complete:
```bash
cd folio_agent
uv run pytest                                # 전체 테스트 (unit + 기본)
uv run python -m src.embeddings.cli          # embed portfolio content
uv run uvicorn src.api:app --reload          # start chatbot API
curl http://localhost:8000/api/health        # health check
curl -X POST http://localhost:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "What projects has YoungIn worked on?"}'
```

### Phase 4 complete:
```bash
# Both servers running (Next.js on 3000, Python on 8000)
# Visit http://localhost:3000 → click floating chat button → ask questions
# Verify streaming responses appear character by character
# Verify origin allowlist: 허용되지 않은 origin으로 API 호출 → 403
# Verify CSRF: X-Requested-With 헤더 없이 호출 → 403
# Verify input length limit: 500+ char message → 400
npm run test:run      # all frontend tests pass
```

### Phase 5 complete:
```bash
# 배포 플랫폼 URL로 health check
curl https://<deployed-url>/api/health
# Vercel 배포 사이트에서 챗봇 동작 확인
# Rate limiting 테스트: 분당 11회 요청 → 429 응답 확인
# 일일 제한 테스트: 50회 초과 → 429 응답 확인
cd folio_agent && uv run pytest   # 전체 Python 테스트 통과 (unit + integration)
```

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Payload 3.0 + React 19 호환성 | Task 3 PoC 검증으로 조기 발견. 실패 시 버전 고정 또는 스키마 단순화 |
| Payload admin route setup complexity | Follow official template exactly, pin version (^3.x) |
| Supabase connection issues in dev/CI | `lib/payload.ts` dev fallback (`data/_static/` 정적 데이터 반환), prod에서는 에러 전파. CI는 프로덕션 동일 조건 + CI 전용 DB로 해결 |
| Async server component testing | Mock `@/lib/payload`, use `await Component()` pattern |
| pgvector embedding dimensions mismatch | Configurable via `settings.embedding_dimensions`, OpenAI `text-embedding-3-small` default 1536 |
| SSE streaming through Next.js proxy | Pass-through `Response(body)` pattern, well-documented |
| 캐시 stale data | `unstable_cache` + Payload `afterChange` hook → `revalidateTag()`. Next.js 16 업그레이드 시 `use cache`로 마이그레이션 |
| Prod에서 빈 페이지 노출 | Dev/prod 분리: prod는 에러 throw → Error Boundary 표시 |
| Render 무료 티어 콜드스타트 (**2-3분**) | self-ping 스케줄러로 완화, UX에 예상 대기 시간 표시, Railway 대안 고려 |
| 챗봇 API 남용 (공개 엔드포인트) | IP 기반 rate limiting (분당 10회 + 일일 50회), Origin allowlist + CSRF custom header 검증, 입력 길이 제한 |
| **API 비용 폭주** | `max_tokens: 1024` 제한, 일일 사용량 cap (IP당 50회/일), 분당 burst 제한 (10회/분). 월간 예상 비용 모니터링 |
| OpenAI API 비용 | `text-embedding-3-small`은 저렴 ($0.02/1M tokens). 포트폴리오 데이터 소량이므로 임베딩 1회 비용 무시 가능 |
| `unstable_cache` deprecation | 현재 Next.js 15.x에서 동작. Next.js 16에서 `use cache`로 교체됨. 마이그레이션 가이드 참고 |
| Next.js proxy Origin 우회 | Origin allowlist (멀티도메인 지원) + CSRF custom header (`X-Requested-With`) 검증으로 simple request 차단. 비브라우저 위조는 rate limit으로 추가 방어 |
| RLS users 테이블 노출 | users 테이블은 public read 대상에서 제외, service_role 전용 정책 적용. 인증 데이터(이메일, 해시) 보호 |
| `data/*.ts` fallback/cleanup 순서 충돌 | Task 20에서 3단계 순서 강제: (1) `data/_static/` 이동 → (2) 참조 경로 업데이트 → (3) type-only 정리. 순서 역전 시 빌드 깨짐 |
| 단위 테스트 외부 API/DB 의존 | 단위 테스트(Tasks 32-35)는 `respx` mock 기반으로 결정적 실행. 통합 테스트(Task 50)는 CI에서 선택적/nightly 실행으로 분리. 테스트 데이터 고정 |
| 서버-클라이언트 보안 계약 불일치 | Task 42(useChatbot)에 `X-Requested-With` 헤더 및 에러 코드별 처리를 명시하여 Task 40-41 서버 요구와 일치시킴 |
| env.ts 검증 미실행 | `payload.config.ts`에서 side-effect import로 강제 실행. import 누락 시 빌드 단계에서 발견 |

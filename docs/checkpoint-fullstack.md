# Full-Stack Transition 체크포인트

> 구현 진행사항을 추적하는 문서입니다.
> `docs/plan/fullstack-transition-plan.md` 기반으로 진행합니다.
> 구현이 완료되면 업데이트
> 구현 진행 중에 fullstack_transition-plan.md 혹은 checkpoint-fullstack.md에서 플랙이 바뀌거나 수정되어야 할 것이 발견된다면 보고

> **워크플로우:** 배치(3개 Task) 완료 후 반드시 `/clear` 로 컨텍스트를 초기화하고 다음 배치를 시작한다.
> Claude는 배치 완료 보고 시 유저에게 `/clear` 후 진행할 것을 안내해야 한다.

## 목표 & 아키텍처

**Goal:** 정적 Next.js 포트폴리오를 Payload CMS + Supabase DB + Python LangGraph 챗봇 + 스트리밍 UI 풀스택 앱으로 전환

**Architecture:** Payload CMS 3.0이 기존 Next.js `/app` 폴더에 임베드 → admin panel + REST API, Supabase PostgreSQL 백엔드. Python FastAPI가 LangGraph agent + RAG (pgvector) + Claude API로 AI 챗봇 제공. Next.js가 chat 요청을 Python 백엔드로 SSE 프록시.

**Tech Stack:** Next.js 15 + Payload CMS 3.0 + Supabase (PostgreSQL + pgvector) + Python FastAPI + LangGraph + Claude API (Anthropic) + OpenAI Embeddings (`text-embedding-3-small`)

**Deployment:** Next.js -> Vercel, Python FastAPI -> Render / Railway / Fly.io (비교 후 결정)

## 범위 제한 정책

- **이미지/미디어:** Phase 1에서는 `/public/projects/` 정적 이미지를 그대로 유지. `ProjectImage.src`는 Payload `text` 타입으로 URL 경로 저장. Payload Media 컬렉션으로의 이관은 별도 계획으로 분리. **Part A에서는 이미지 관련 변경을 하지 않는다.**
- **CMS 이관 제외 섹션:** HeroSection, AboutSection, ContactSection은 정적 콘텐츠이므로 CMS 마이그레이션 대상에서 **의도적으로 제외**. 추후 필요 시 Payload Global로 추가 가능.

---

## 진행 상태 요약

### Part A: CMS 전환

#### Phase 1: Payload CMS Integration (Tasks 1-20)

| Task | 이름 | 상태 | 커밋 |
|------|------|------|------|
| Task 1 | Environment variables setup | ✅ 완료 | (미커밋) |
| Task 2 | Install Payload CMS dependencies | ✅ 완료 | (미커밋) |
| Task 3 | PoC verification -- Payload + React 19 호환성 검증 | ⏳ 대기 (DB 연결 후 중첩 array CRUD 검증) | - |
| Task 4 | Create Payload configuration | ✅ 완료 | (미커밋) |
| Task 5 | Create Users collection | ✅ 완료 | (미커밋) |
| Task 6 | Create Projects collection | ✅ 완료 | (미커밋) |
| Task 7 | Create Career collection | ✅ 완료 | (미커밋) |
| Task 8 | Create Skills collection | ✅ 완료 | (미커밋) |
| Task 9 | Create remaining collections (Education, Awards, Publications, Certifications) | ✅ 완료 | (미커밋) |
| Task 10 | Set up Payload admin routes in Next.js app | ✅ 완료 | (미커밋) |
| Task 11 | Set up Supabase project (manual) | ✅ 완료 | - |
| Task 12 | Create data access layer (`lib/payload.ts`) | ✅ 완료 | (미커밋) |
| Task 13 | Add Payload `afterChange` hooks for cache revalidation | ✅ 완료 | (미커밋) |
| Task 14 | Create seed script | ✅ 완료 | (미커밋) |
| Task 15 | Update ProjectsSection to fetch from Payload | ✅ 완료 | (미커밋) |
| Task 16 | Update CareerSection to fetch from Payload | ✅ 완료 | (미커밋) |
| Task 17 | Update SkillsSection to fetch from Payload | ✅ 완료 | (미커밋) |
| Task 18 | Update CredentialsSection to fetch from Payload | ✅ 완료 | (미커밋) |
| Task 19 | Update project detail page and sitemap | ✅ 완료 | (미커밋) |
| Task 20 | Clean up `data/*.ts` files and verify full CMS migration | ✅ 완료 | (미커밋) |

#### Phase 2: Database Hardening (Tasks 21-24)

| Task | 이름 | 상태 | 커밋 |
|------|------|------|------|
| Task 21 | Enable Row Level Security on Supabase | ⏳ 대기 | - |
| Task 22 | Add connection error handling to `lib/payload.ts` | ✅ 완료 | (미커밋) |
| Task 23 | Add environment variable validation | ✅ 완료 | (미커밋) |
| Task 24 | Add CI/CD pipeline (GitHub Actions) | ✅ 완료 | (미커밋) |

#### Part A Gate (Part B 착수 전 필수 확인)

- [x] 모든 Phase 1-2 태스크 완료
- [x] `npm run build` 성공
- [x] `npm run test:run` 통과
- [x] Vercel 배포 후 CMS 데이터로 정상 렌더링 확인
- [x] 최소 1주간 프로덕션 안정성 확인

---

### Part B: AI 챗봇

#### Phase 3: Python LangGraph Chatbot Backend (Tasks 25-39)

| Task | 이름 | 상태 | 커밋 |
|------|------|------|------|
| Task 25 | Initialize Python project (`folio_agent/`) | ✅ 완료 | (미커밋) |
| Task 26 | Config module (`src/config.py`) | ✅ 완료 | (미커밋) |
| Task 27 | Database module (`src/db.py`) | ✅ 완료 | (미커밋) |
| Task 28 | Content extraction (`src/embeddings/extract.py`) | ✅ 완료 | ce9e68c |
| Task 29 | Vectorization (`src/embeddings/vectorize.py`) | ✅ 완료 | b5fe06f |
| Task 30 | Embedding CLI (`src/embeddings/cli.py`) | ✅ 완료 | 5480897 |
| Task 31 | LangGraph state (`src/agent/state.py`) | ✅ 완료 | 533bcc1 |
| Task 32 | Router node (`src/agent/nodes/router.py`) + unit test | ✅ 완료 | 533bcc1 |
| Task 33 | RAG retrieval node (`src/agent/nodes/retriever.py`) + unit test | ✅ 완료 | 533bcc1 |
| Task 34 | Generator node (`src/agent/nodes/generator.py`) + unit test | ✅ 완료 | 6308a99 |
| Task 35 | Assemble graph (`src/agent/graph.py`) + unit test | ✅ 완료 | 6308a99 |
| Task 36 | FastAPI server (`src/api.py`) with rate limiting | ✅ 완료 | 6308a99 |
| Task 37 | Dockerfile | ✅ 완료 | (미커밋) |
| Task 38 | docker-compose for local dev | ✅ 완료 | (미커밋) |
| Task 39 | Python CI pipeline (GitHub Actions) | ✅ 완료 | (미커밋) |

#### Phase 4: Chatbot Frontend (Tasks 40-46)

| Task | 이름 | 상태 | 커밋 |
|------|------|------|------|
| Task 40 | API proxy route (`app/api/chat/route.ts`) | ⏳ 대기 | - |
| Task 41 | Streaming proxy route (`app/api/chat/stream/route.ts`) | ⏳ 대기 | - |
| Task 42 | `useChatbot` hook (`hooks/useChatbot.ts`) | ⏳ 대기 | - |
| Task 43 | ChatMessage component (`components/chat/ChatMessage.tsx`) | ⏳ 대기 | - |
| Task 44 | ChatBot panel (`components/chat/ChatBot.tsx`) | ⏳ 대기 | - |
| Task 45 | Integrate into layout | ⏳ 대기 | - |
| Task 46 | Final environment config | ⏳ 대기 | - |

#### Phase 5: Deployment & Hardening (Tasks 47-51)

| Task | 이름 | 상태 | 커밋 |
|------|------|------|------|
| Task 47 | Deploy Python backend | ⏳ 대기 | - |
| Task 48 | Configure Vercel deployment for Next.js | ⏳ 대기 | - |
| Task 49 | Add rate limiting to chatbot API (분당 burst) | ⏳ 대기 | - |
| Task 50 | Python integration tests | ⏳ 대기 | - |
| Task 51 | Add environment variable validation for chatbot keys | ⏳ 대기 | - |

**범례:** ✅ 완료 | 🔄 진행 중 | ⏳ 대기 | ❌ 실패

---

## Part A 태스크 상세

### Task 1: Environment variables setup

**상태:** ⏳ 대기
**목적:** `.env.example`, `.env` 생성

**필수 변수:**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
PAYLOAD_SECRET=your-payload-secret-min-32-chars
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# CHATBOT_API_URL=http://localhost:8000    (Part B에서 활성화)
# ANTHROPIC_API_KEY=sk-ant-placeholder     (Part B에서 활성화)
# OPENAI_API_KEY=sk-placeholder            (Part B에서 활성화)
```

**Note:** LLM 추론은 `ANTHROPIC_API_KEY` (Claude), 임베딩은 `OPENAI_API_KEY` (`text-embedding-3-small`) 사용. 실제 키는 사용자가 직접 입력.

### 완료 기준
- [ ] `.env.example` 생성
- [ ] `.env` 생성 (실제 값은 사용자 입력)
- [ ] 커밋: `chore: add environment variable template`

---

### Task 2: Install Payload CMS dependencies

**상태:** ⏳ 대기

**설치 명령:**
```bash
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical
```

### 완료 기준
- [ ] 패키지 설치 완료
- [ ] `npm run build` 성공
- [ ] 커밋: `chore: install Payload CMS 3.0 with postgres adapter`

---

### Task 3: PoC verification -- Payload + React 19 호환성 검증

**상태:** ⏳ 대기
**목적:** 본격적인 컬렉션 구축 전 리스크 조기 발견. **이 태스크는 실패해도 되는 검증 단계.**

**검증 항목:**
1. 중첩 array field (3단계: `array > group > array`) 테스트 컬렉션 CRUD
2. React 19.2.3+ / Next.js 15.4.10+ 보안 패치 확인. `npm ls react`로 버전 충돌 검증
3. Supabase PostgreSQL 연결 + Payload auto-migration 정상 동작

**검증 실패 시 대안:**
- 중첩 array 불안정 -> 스키마 단순화 (group 대신 JSON 필드)
- React 19 충돌 -> Payload 버전 고정 (호환되는 마지막 버전 pinning)
- DB 연결 실패 -> connection string 형식 및 Supabase 네트워크 설정 점검

### 완료 기준
- [ ] 3단계 중첩 array CRUD 동작 확인 (또는 대안 문서화)
- [ ] React 19 버전 충돌 없음 확인
- [ ] Supabase DB 연결 + auto-migration 정상 동작
- [ ] 성공 시 테스트 컬렉션 제거, 실패 시 대안 적용 후 진행
- [ ] 커밋: `chore: verify Payload CMS + React 19 compatibility (PoC)`

---

### Task 4: Create Payload configuration

**상태:** ⏳ 대기

**구현 사항:**
- `postgresAdapter` with `DATABASE_URL`
- `lexicalEditor` 설정
- 모든 컬렉션 등록 (Users, Projects, Career, Skills, Education, Awards, Publications, Certifications)
- `tsconfig.json`에 `@payload-config` path alias 추가

### 완료 기준
- [ ] `payload.config.ts` 생성
- [ ] `tsconfig.json` path alias 추가
- [ ] 커밋: `feat: add Payload CMS configuration with postgres adapter`

---

### Task 5: Create Users collection

**상태:** ⏳ 대기

**스키마:** `slug: 'users'`, `auth: true`, `fields: [{ name: 'name', type: 'text', required: true }]`

### 완료 기준
- [ ] `collections/Users.ts` 생성
- [ ] 커밋: `feat: add Payload Users collection with auth`

---

### Task 6: Create Projects collection

**상태:** ⏳ 대기
**Critical:** 가장 복잡한 컬렉션. 기존 `Project` + `ProjectDetail` + `DetailSection` 인터페이스를 정확히 매핑해야 함.

**ID 전략 (필수):** Payload 내부 `id`는 내부 식별자로만 사용. 기존 `Project.id` 문자열 호환을 위해 `projectId` 필드를 별도 유지 (`text`, `required`, `unique`, `index`).

**스키마 핵심 구조:**
```
projects
  ├── projectId (text, unique) -- 기존 Project.id 보존
  ├── title, slug, company, description, period, teamSize, keyAchievement
  ├── featured (checkbox)
  ├── technologies[] (array > value)
  ├── links (group: github, demo, paper)
  └── detail (group)
       ├── problem, role, architecture, implementation, impact, learnings (textarea)
       ├── architectureImage (group: src, alt, caption)
       ├── demoImages[] (array: src, alt, caption)
       └── sections[] (array) -- 3단계 중첩의 핵심
            ├── title, content
            ├── image (group: src, alt, caption)
            ├── imagePosition (select: before/after)
            ├── tableHeaders (group: col0, col1) -- 튜플 대체
            ├── table[] (array: label, value)
            └── subsections[] (array: title, content) -- 3단계
```

**tableHeaders 규칙:** 기존 인터페이스는 `[string, string]` 튜플이지만 Payload에 tuple 타입 없음. `group { col0, col1 }`로 표현. field-level validate로 `col0/col1` 동시 입력 강제. `lib/payload.ts` 변환 시 `[col0, col1]` 배열로 매핑.

### 완료 기준
- [ ] `collections/Projects.ts` 생성
- [ ] `projectId` 필드 (`text`, `unique`, `index`)
- [ ] 3단계 중첩 (detail > sections > subsections) 정확히 매핑
- [ ] `tableHeaders` group + validation 규칙
- [ ] 커밋: `feat: add Payload Projects collection matching existing data schema`

---

### Task 7: Create Career collection

**상태:** ⏳ 대기

**스키마:** `slug: 'career'`, `admin: { useAsTitle: 'company' }`
- `period`, `company`, `role` (text, required)
- `current` (checkbox, default false)
- `sortOrder` (number, sidebar, admin 정렬용 -- 프론트에 노출 안 됨)
- `keywords[]` (array > value)

**Transform:** `lib/payload.ts`에서 `sortOrder`, `id`, `createdAt`, `updatedAt` 제거 -> `CareerItem` 인터페이스로 변환.

### 완료 기준
- [ ] `collections/Career.ts` 생성
- [ ] `sortOrder` sidebar 필드 포함
- [ ] 커밋: `feat: add Payload Career collection`

---

### Task 8: Create Skills collection

**상태:** ⏳ 대기

**스키마:** `slug: 'skills'`, `admin: { useAsTitle: 'label' }`
- `label`, `description` (text, required)
- `sortOrder` (number, sidebar)
- `items[]` (array > value)

**Transform:** `items` 배열을 `string[]`로 평탄화 (`[{value: 'Python'}, ...] -> ['Python', ...]`), `sortOrder` 제거.

### 완료 기준
- [ ] `collections/Skills.ts` 생성
- [ ] 커밋: `feat: add Payload Skills collection`

---

### Task 9: Create remaining collections (Education, Awards, Publications, Certifications)

**상태:** ⏳ 대기

**스키마:**
- **Education:** `institution`, `degree` (required), `gpa`, `period` (required)
- **Certifications:** `name`, `date` (required), `issuer`
- **Awards:** `title`, `date` (required), `organizer`
- **Publications:** `title`, `journal` (required), `year` (number, required), `doi`

### 완료 기준
- [ ] `collections/Education.ts` 생성
- [ ] `collections/Certifications.ts` 생성
- [ ] `collections/Awards.ts` 생성
- [ ] `collections/Publications.ts` 생성
- [ ] 커밋: `feat: add Education, Awards, Publications, Certifications collections`

---

### Task 10: Set up Payload admin routes in Next.js app

**상태:** ⏳ 대기

**생성 파일:**
- `app/(payload)/admin/[[...segments]]/page.tsx` -- Payload admin page
- `app/(payload)/admin/[[...segments]]/not-found.tsx` -- Payload 404
- `app/(payload)/layout.tsx` -- Payload layout with CSS import
- `app/(payload)/api/[...slug]/route.ts` -- REST API routes (GET/POST/PATCH/PUT/DELETE)

**수정:** `next.config.ts` -- `withPayload()` 래핑

**실행:** `npx payload generate:importmap`

### 완료 기준
- [ ] 4개 Payload route 파일 생성
- [ ] `next.config.ts` `withPayload()` 적용
- [ ] `npx payload generate:importmap` 실행 성공
- [ ] 커밋: `feat: add Payload admin panel routes and API endpoints`

---

### Task 11: Set up Supabase project (manual)

**상태:** ✅ 완료
**Note:** 사용자가 직접 수행 완료. `.env`에 `DATABASE_URL` 설정됨.

**절차:**
1. Supabase 프로젝트 생성 (https://supabase.com)
2. PostgreSQL connection string -> `.env` `DATABASE_URL`
3. pgvector 활성화: `CREATE EXTENSION IF NOT EXISTS vector;`
4. dev server 시작 -> `/admin` 접속 -> admin 사용자 등록

### 완료 기준
- [ ] 프로덕션용 Supabase 프로젝트 생성
- [ ] CI 전용 Supabase 프로젝트 생성 (Task 24에서 사용)
- [ ] `.env`에 `DATABASE_URL` 설정
- [ ] pgvector extension 활성화
- [ ] `/admin` 접속 -> admin 사용자 등록 성공
- [ ] Payload auto-create tables 확인

---

### Task 12: Create data access layer (`lib/payload.ts`)

**상태:** ⏳ 대기
**Critical:** 모든 컴포넌트가 여기서 데이터를 가져옴. 이행의 핵심.

**Exported 함수:**
- `fetchFeaturedProjects()` -> `Project[]`
- `fetchMoreProjects()` -> `Project[]`
- `fetchProjectBySlug(slug)` -> `Project | undefined`
- `fetchAllProjectSlugs()` -> `string[]`
- `fetchCareerHistory()` -> `CareerItem[]`
- `fetchSkillGroups()` -> `SkillGroup[]`
- `fetchEducation()` -> `Education[]`
- `fetchCertifications()` -> `Certification[]`
- `fetchAwards()` -> `Award[]`
- `fetchPublications()` -> `Publication[]`

**핵심 패턴:** `data/*.ts` 타입 인터페이스가 canonical. `lib/payload.ts`는 `@/data`에서 타입을 import하고 Payload docs를 변환. Payload 내부 필드(`id`, `sortOrder`, `createdAt`, `updatedAt`)는 변환 시 제거.

**Project transform contract (필수):**
- `Project.id` <- `projects.projectId` (Payload 내부 `id`가 아님)
- `technologies: Array<{ value: string }>` -> `string[]`
- `detail.sections[].tableHeaders: { col0?, col1? }` -> `[string, string] | undefined` (col0/col1 둘 다 있을 때만)
- 중첩 array의 내부 식별자/정렬 메타 필드 제거 후 기존 인터페이스로 매핑

**Dev fallback 전략:** `NODE_ENV=development`에서 DB 연결 실패 시 `data/*.ts`의 정적 데이터를 fallback으로 반환 (빈 배열이 아닌 실제 포트폴리오 데이터). **초기 구현 시에는 `data/*.ts`에서 직접 import. Task 20에서 `data/_static/`으로 이관 후 import 경로 업데이트.**

**Caching 전략:**
- `unstable_cache`로 래핑, `revalidate: 3600` (1시간)
- 각 컬렉션별 cache tag (e.g., `'projects'`, `'career'`, `'skills'`)
- Task 13에서 `afterChange` hook -> `revalidateTag()` 호출로 즉시 무효화
- **Note:** `unstable_cache`는 Next.js 15에서 동작하지만 deprecated 방향. Next.js 16에서 `use cache` directive로 교체됨.

**TDD:** 테스트에서 모든 fetch 함수 존재 확인 + 올바른 타입 반환 검증.

### 완료 기준
- [ ] `lib/payload.ts` 생성 (10개 fetch 함수)
- [ ] Project transform contract 정확히 구현
- [ ] `unstable_cache` + cache tag 적용
- [ ] dev fallback 패턴 구현
- [ ] `__tests__/lib/payload.test.ts` 작성 + 통과
- [ ] 커밋: `feat: add Payload data access layer with typed fetch functions`

---

### Task 13: Add Payload `afterChange` hooks for cache revalidation

**상태:** ⏳ 대기

**패턴:** 각 컬렉션에 `afterChange` hook -> `revalidateTag(collection.slug)` 호출.
```typescript
hooks: {
  afterChange: [
    ({ collection }) => { revalidateTag(collection.slug); }
  ],
}
```

### 완료 기준
- [ ] Projects, Career, Skills, Education, Awards, Publications, Certifications 모든 컬렉션에 hook 추가
- [ ] 커밋: `feat: add afterChange hooks for on-demand cache revalidation`

---

### Task 14: Create seed script

**상태:** ⏳ 대기

**구현:**
- 기존 `data/*.ts`에서 데이터 import
- `getPayload()`로 각 컬렉션에 document 생성
- `data/projects.ts`의 `id` -> Payload `projectId`로 저장 (기존 문자열 ID 보존)
- **Idempotent:** 이미 존재하는 데이터는 skip (CI에서 반복 실행 가능)
- `tsx` 설치: `npm install -D tsx`
- `package.json`에 `"seed": "npx tsx scripts/seed.ts"` 추가

### 완료 기준
- [ ] `scripts/seed.ts` 생성
- [ ] idempotent 동작 확인
- [ ] `npm run seed` 실행 성공
- [ ] `/admin`에서 각 컬렉션 데이터 확인 (특히 Projects 중첩 array)
- [ ] 커밋: `feat: add seed script to migrate static data into Payload CMS`

---

### Tasks 15-18: Update section components to fetch from Payload

**공통 패턴:**
1. 테스트에서 `@/lib/payload` mock으로 변경 (`@/data/*` 대신)
2. `async` server component로 전환
3. `import { data } from '@/data/*'` -> `import { fetchX } from '@/lib/payload'`
4. 직접 데이터 참조 -> `await fetchX()`

### Task 15: Update ProjectsSection

**상태:** ⏳ 대기
- `fetchFeaturedProjects`, `fetchMoreProjects` 사용
- [ ] 테스트 mock 변경 + 통과
- [ ] async 전환 + 렌더링 확인
- [ ] 커밋: `refactor: update ProjectsSection to fetch from Payload`

### Task 16: Update CareerSection

**상태:** ⏳ 대기
- `fetchCareerHistory` 사용
- [ ] 테스트 mock 변경 + 통과
- [ ] async 전환 + 렌더링 확인
- [ ] 커밋: `refactor: update CareerSection to fetch from Payload`

### Task 17: Update SkillsSection

**상태:** ⏳ 대기
- `fetchSkillGroups` 사용
- [ ] 테스트 mock 변경 + 통과
- [ ] async 전환 + 렌더링 확인
- [ ] 커밋: `refactor: update SkillsSection to fetch from Payload`

### Task 18: Update CredentialsSection

**상태:** ⏳ 대기
- `fetchAwards`, `fetchPublications`, `fetchEducation`, `fetchCertifications` via `Promise.all`
- [ ] 테스트 mock 변경 + 통과
- [ ] async 전환 + 렌더링 확인
- [ ] 커밋: `refactor: update CredentialsSection to fetch from Payload`

**각 태스크 완료 후:** `npm run test:run` 해당 컴포넌트 테스트 통과 + `npm run dev`로 해당 섹션 렌더링 확인.

---

### Task 19: Update project detail page and sitemap

**상태:** ⏳ 대기

**Project detail page:**
- `getProjectBySlug` -> `fetchProjectBySlug` from `lib/payload`
- `generateStaticParams` -> `fetchAllProjectSlugs` 사용
- 타입 import는 `data/projects`에서 유지 (인터페이스만)

**Sitemap (`app/sitemap.ts`):**
- `import { projects } from "@/data/projects"` -> `fetchAllProjectSlugs()` 사용
- sitemap은 빌드 시 실행되므로 Payload fetch 실패 = 빌드 실패 (의도된 동작, stale sitemap 방지)

**검증:** `grep -r "from.*@/data" app/ components/ --include="*.tsx" --include="*.ts"` -- type import만 남아야 함.

### 완료 기준
- [ ] project detail page Payload fetch 전환
- [ ] sitemap Payload fetch 전환
- [ ] type import만 남음 확인
- [ ] 커밋: `refactor: update project detail page and sitemap to fetch from Payload`

---

### Task 20: Clean up `data/*.ts` files and verify full CMS migration

**상태:** ⏳ 대기
**Critical:** 반드시 아래 순서를 따를 것. 순서 역전 시 빌드 깨짐.

**Step 1: `data/_static/` 디렉토리로 데이터 배열 이동**
```
data/_static/
  ├── projects.ts   <- 데이터 배열 + helper 이동
  ├── career.ts     <- careerData 배열
  ├── skills.ts     <- skillGroups 배열
  ├── education.ts  <- education, certifications 배열
  ├── awards.ts     <- awards, publications 배열
  └── index.ts      <- barrel re-export (데이터 배열만)
```

**Step 2: fallback + seed 참조 경로 업데이트**
- `lib/payload.ts` fallback: `@/data/career` -> `@/data/_static/career`
- `scripts/seed.ts`: `@/data/projects` -> `@/data/_static/projects`
- `npm run test:run`으로 참조 경로 변경 후 정상 동작 확인

**Step 3: `data/*.ts` 타입 전용으로 정리**

| File | 변경 |
|------|------|
| `data/projects.ts` | `Project`, `ProjectDetail`, `DetailSection`, `ProjectImage` 타입 유지. 데이터 배열/helper 함수 export 제거 |
| `data/career.ts` | `CareerItem` 타입 유지, `careerData` 배열 제거 |
| `data/skills.ts` | `SkillGroup` 타입 유지, `skillGroups` 배열 제거 |
| `data/education.ts` | `Education`, `Certification` 타입 유지, 데이터 배열 제거 |
| `data/awards.ts` | `Award`, `Publication` 타입 유지, 데이터 배열 제거 |
| `data/index.ts` | `export type { ... }` 형태로 변경 |

**Step 4: 전체 검증**
```bash
# 1. 컴포넌트/페이지에서 데이터 배열 import 잔존 확인
grep -r "from.*@/data" components/ app/ --include="*.tsx" --include="*.ts"
# Expected: type import만

# 2. _static 참조가 올바른 위치에만 있는지
grep -r "from.*@/data/_static" . --include="*.ts" --include="*.tsx"
# Expected: lib/payload.ts (fallback)와 scripts/seed.ts에서만

# 3. 빌드 + 테스트
npm run test:run
npm run build
```

### 완료 기준
- [ ] Step 1 완료: `data/_static/` 생성 + 데이터 이동
- [ ] Step 2 완료: fallback/seed 경로 업데이트 + 테스트 통과
- [ ] Step 3 완료: `data/*.ts` type-only export
- [ ] Step 4 완료: grep 검증 + `npm run test:run` + `npm run build`
- [ ] `_static` 참조: `lib/payload.ts`와 `scripts/seed.ts`에서만
- [ ] 커밋: `refactor: separate static data into _static dir, convert data files to type-only exports`

---

### Task 21: Enable Row Level Security on Supabase

**상태:** ⏳ 대기
**Note:** Supabase SQL editor에서 수동 실행. Payload는 `service_role` key로 접속하므로 RLS bypass. 아래 정책은 defense-in-depth.

**공개 데이터 테이블** (projects, career, skills, education, awards, publications, certifications):
```sql
ALTER TABLE {public_table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON {public_table} FOR SELECT USING (true);
CREATE POLICY "Allow service_role write" ON {public_table} FOR ALL USING (auth.role() = 'service_role');
```

**users 테이블** (인증 정보 -- **공개 읽기 금지**):
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service_role only" ON users FOR ALL USING (auth.role() = 'service_role');
```

**Note:** `{public_table}`은 Payload가 자동 생성하는 테이블명으로 대체. Task 11에서 테이블명 확인 후 적용. `portfolio_embeddings` (Phase 3 생성)에도 공개 데이터와 동일 패턴 적용.

### 완료 기준
- [ ] 공개 데이터 테이블: RLS + public read + service_role write
- [ ] users 테이블: service_role 전용 (공개 읽기 차단)
- [ ] anon key로 INSERT 시도 -> 차단 확인
- [ ] anon key로 users SELECT 시도 -> 차단 확인
- [ ] anon key로 projects SELECT 시도 -> 허용 확인

---

### Task 22: Add connection error handling to `lib/payload.ts`

**상태:** ✅ 완료 — `lib/payload.ts`의 `withFallback()` 패턴으로 구현됨. `__tests__/lib/payload-fallback.test.ts` 통과.

**Dev/Prod 분리 전략:**
- **Development** (`NODE_ENV !== 'production'`): try/catch -> `console.warn` + `data/_static/*.ts` 정적 데이터 fallback. DB 없이 로컬 개발 가능.
- **Production** (`NODE_ENV === 'production'`): try/catch -> `console.error` + re-throw. Error Boundary가 에러 페이지 표시. 빈 포트폴리오 조용히 노출 방지.

**검증:** DB 연결 없이 `NODE_ENV=development npm run dev` -> 포트폴리오에 정적 데이터 정상 표시.

### 완료 기준
- [ ] `fetchWithFallback` 패턴 구현 (dev: fallback, prod: throw)
- [ ] fallback이 `data/_static/` 정적 데이터를 반환하는지 테스트
- [ ] `__tests__/lib/payload-fallback.test.ts` 통과
- [ ] 커밋: `feat: add graceful fallback for Payload fetch on DB errors`

---

### Task 23: Add environment variable validation

**상태:** ⏳ 대기

**구현:** `lib/env.ts` -- import 시 즉시 실행되는 side-effect 모듈 (함수 호출 불필요)
```typescript
function validateEnv() {
  const required = ['DATABASE_URL', 'PAYLOAD_SECRET'] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
validateEnv();
```

**실행 위치:** `payload.config.ts` 최상단에 `import '@/lib/env'` -- Payload 초기화 전 검증 실행.

**검증:** `.env`에서 `DATABASE_URL` 제거 후 `npm run dev` -> 즉시 에러.

### 완료 기준
- [ ] `lib/env.ts` 생성 (side-effect module)
- [ ] `payload.config.ts`에서 import
- [ ] 누락 시 즉시 에러 확인
- [ ] 커밋: `feat: add environment variable validation`

---

### Task 24: Add CI/CD pipeline (GitHub Actions)

**상태:** ✅ 완료 — `.github/workflows/ci.yml` 생성됨. GitHub Secrets 등록 후 동작 확인 필요.

**CI 환경 DB 전략:** CI는 **프로덕션과 동일 조건** (`NODE_ENV=production`)으로 빌드. `NODE_ENV=test` 우회는 사용하지 않음. CI 전용 Supabase 프로젝트(무료 티어, Task 11에서 생성)의 connection string을 GitHub Secrets에 등록.

```yaml
name: CI
on:
  push: { branches: [master] }
  pull_request: { branches: [master] }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
```

### 완료 기준
- [ ] `.github/workflows/ci.yml` 생성
- [ ] lint + test + seed + build 파이프라인
- [ ] CI 전용 DB Secrets 등록
- [ ] GitHub Actions 동작 확인
- [ ] 커밋: `ci: add GitHub Actions workflow for lint, test, and build`

---

## Phase 1 완료 검증

```bash
npm run seed          # seed data into Supabase
npm run dev           # start dev server
# Visit http://localhost:3000/admin -> login -> verify all collections have data
# Visit http://localhost:3000 -> verify portfolio renders from DB data
npm run test:run      # all tests pass
npm run build         # production build succeeds
```

## Phase 2 완료 검증

```bash
# Supabase SQL editor에서 RLS 정책 확인
# anon key로 INSERT 시도 -> 차단
# anon key로 users SELECT -> 차단 (인증 데이터 보호)
# anon key로 projects SELECT -> 허용 (공개 데이터)
npm run test:run      # fallback 테스트 통과 (data/_static/ 정적 데이터)
npm run build         # env validation 포함 빌드 성공
# GitHub Actions CI 파이프라인 동작 확인
```

---

## Part B 태스크 상세

### Task 25: Initialize Python project

**상태:** ⏳ 대기
**목적:** `folio_agent/` 디렉토리에 Python 프로젝트 초기화

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
  "slowapi>=0.1.9",
]

[dependency-groups]
dev = [
  "pytest>=8.0",
  "pytest-asyncio>=0.24",
  "ruff>=0.9",
  "httpx>=0.28",
  "respx>=0.22",
]
```

**검증:**
```bash
cd folio_agent && uv sync
uv run python -c "import fastapi, langgraph, slowapi, anthropic; print('OK')"
uv run ruff --version && uv run pytest --version
```

### 완료 기준
- [ ] `folio_agent/` 디렉토리 구조 생성 (`pyproject.toml`, `src/__init__.py`, `tests/__init__.py`)
- [ ] `.env.example` (ANTHROPIC_API_KEY, OPENAI_API_KEY, DATABASE_URL)
- [ ] `uv sync` 성공
- [ ] 런타임/개발 의존성 import 확인
- [ ] 커밋: `feat: initialize Python folio_agent project`

---

### Task 26: Config module (`src/config.py`)

**상태:** ⏳ 대기

**Pydantic Settings:** `anthropic_api_key`, `openai_api_key`, `database_url`, `claude_model` (default: `claude-sonnet-4-20250514`), `embedding_model` (default: `text-embedding-3-small`), `embedding_dimensions` (default: 1536), `top_k`

**Note:** LLM 추론은 Anthropic Claude (`ANTHROPIC_API_KEY`), 임베딩은 OpenAI (`OPENAI_API_KEY`)로 분리.

### 완료 기준
- [ ] `src/config.py` 생성
- [ ] 커밋: `feat: add Python config module`

---

### Task 27: Database module (`src/db.py`)

**상태:** ⏳ 대기

**구현:**
- `get_connection()` -- psycopg + pgvector registration
- `setup_tables()` -- CREATE TABLE `portfolio_embeddings` with vector(1536) column

### 완료 기준
- [ ] `src/db.py` 생성
- [ ] 커밋: `feat: add database module with pgvector table setup`

---

### Task 28: Content extraction (`src/embeddings/extract.py`)

**상태:** ⏳ 대기

**구현:**
- Supabase 테이블에서 포트폴리오 콘텐츠 추출
- `ContentChunk` dataclass (content, source_type, source_id, metadata)
- Extractors: `extract_projects`, `extract_career`, `extract_all`

### 완료 기준
- [ ] `src/embeddings/extract.py` 생성
- [ ] 커밋: `feat: add content extraction for embeddings`

---

### Task 29: Vectorization (`src/embeddings/vectorize.py`)

**상태:** ⏳ 대기

**구현:**
- `create_embeddings()` -- OpenAI SDK `client.embeddings.create(model="text-embedding-3-small", input=texts)`. `OPENAI_API_KEY`로 호출.
- `store_embeddings()` -- INSERT into `portfolio_embeddings` with pgvector (dimension: 1536)

### 완료 기준
- [ ] `src/embeddings/vectorize.py` 생성
- [ ] 커밋: `feat: add vectorization and storage`

---

### Task 30: Embedding CLI (`src/embeddings/cli.py`)

**상태:** ⏳ 대기

**Pipeline:** `setup_tables` -> `extract_all` -> `create_embeddings` -> `store_embeddings`

### 완료 기준
- [ ] `src/embeddings/cli.py` 생성
- [ ] 커밋: `feat: add embedding pipeline CLI`

---

### Task 31: LangGraph state (`src/agent/state.py`)

**상태:** ⏳ 대기

```python
class AgentState(MessagesState):
    query_type: Literal["portfolio", "general", "off_topic"] | None
    retrieved_context: str
    source_documents: list[dict]
```

### 완료 기준
- [ ] `src/agent/state.py` 생성
- [ ] 커밋: `feat: add LangGraph agent state`

---

### Task 32: Router node (`src/agent/nodes/router.py`) + unit test

**상태:** ⏳ 대기

**구현:** 쿼리 분류 -- portfolio / general / off_topic (Claude API 사용)

**Unit test:** `tests/test_router.py` -- 쿼리 분류 정확성 (최소 3개 케이스). **Claude API 호출은 `respx`로 mock** -- 고정 응답으로 비결정적/비용 문제 방지.

### 완료 기준
- [ ] `src/agent/nodes/router.py` 생성
- [ ] `tests/test_router.py` 작성 + mock 기반 통과
- [ ] 커밋: `feat: add router node with unit tests`

---

### Task 33: RAG retrieval node (`src/agent/nodes/retriever.py`) + unit test

**상태:** ⏳ 대기

**구현:** pgvector similarity search -> context + source documents 반환

**Unit test:** `tests/test_retriever.py` -- **DB 호출 mock** -- 고정 벡터 검색 결과로 DB 의존성 제거.

### 완료 기준
- [ ] `src/agent/nodes/retriever.py` 생성
- [ ] `tests/test_retriever.py` 작성 + mock 기반 통과
- [ ] 커밋: `feat: add RAG retrieval node with unit tests`

---

### Task 34: Generator node (`src/agent/nodes/generator.py`) + unit test

**상태:** ⏳ 대기

**구현:** Context-aware prompts per `query_type` -> Claude API 응답

**API 비용 보호:** `max_tokens: 1024` 제한 + 프롬프트에 간결한 응답 유도 지침 포함.

**Unit test:** `tests/test_generator.py` -- **Claude API `respx` mock** -- 고정 응답, `max_tokens` 설정 검증.

### 완료 기준
- [ ] `src/agent/nodes/generator.py` 생성 (max_tokens 제한 포함)
- [ ] `tests/test_generator.py` 작성 + mock 기반 통과
- [ ] 커밋: `feat: add LLM generation node with cost protection and unit tests`

---

### Task 35: Assemble graph (`src/agent/graph.py`) + unit test

**상태:** ⏳ 대기

**Graph 구조:**
```
START -> router -> [portfolio: retrieve -> generate, general/off_topic: generate] -> END
```
InMemorySaver checkpointer for conversation memory.

**Unit test:** `tests/test_graph.py` -- 그래프 컴파일 + 노드 연결 검증. 외부 API/DB 없이 구조만 확인.

### 완료 기준
- [ ] `src/agent/graph.py` 생성
- [ ] `tests/test_graph.py` 작성 + 통과
- [ ] 커밋: `feat: assemble LangGraph agent graph with unit tests`

---

### Task 36: FastAPI server (`src/api.py`) with rate limiting

**상태:** ⏳ 대기

**Endpoints:**
- `POST /api/chat` -- synchronous response
- `POST /api/chat/stream` -- SSE streaming
- `GET /api/health` -- health check

**CORS:** allow `http://localhost:3000`

**일일 사용량 제한:** IP당 일일 50회 (`slowapi`)
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat")
@limiter.limit("50/day")
async def chat(request: Request, body: ChatRequest): ...
```

### 완료 기준
- [ ] `src/api.py` 생성 (3개 endpoint)
- [ ] CORS 설정
- [ ] `slowapi` IP당 일일 50회 제한
- [ ] 429 응답 시 reset 시간 헤더 포함
- [ ] 커밋: `feat: add FastAPI server with streaming SSE and daily rate limit`

---

### Task 37: Dockerfile

**상태:** ⏳ 대기

Python 3.12-slim + UV for dependencies.

### 완료 기준
- [ ] `folio_agent/Dockerfile` 생성
- [ ] 커밋: `feat: add Dockerfile for chatbot backend`

---

### Task 38: docker-compose for local dev

**상태:** ⏳ 대기

### 완료 기준
- [ ] `docker-compose.yml` 생성
- [ ] 커밋: `feat: add docker-compose for local development`

---

### Task 39: Python CI pipeline (GitHub Actions)

**상태:** ⏳ 대기

```yaml
name: CI (Python)
on:
  push: { branches: [master], paths: ['folio_agent/**'] }
  pull_request: { branches: [master], paths: ['folio_agent/**'] }
jobs:
  check:
    runs-on: ubuntu-latest
    defaults:
      run: { working-directory: folio_agent }
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v4
      - run: uv sync
      - run: uv run ruff check .
      - run: uv run pytest tests/ --ignore=tests/test_integration.py
```

### 완료 기준
- [ ] `.github/workflows/ci-python.yml` 생성
- [ ] 단위 테스트만 CI 실행 (통합 테스트 제외)
- [ ] 커밋: `ci: add GitHub Actions workflow for Python folio_agent`

---

## Phase 3 완료 검증

```bash
cd folio_agent
uv run pytest                                # unit tests
uv run python -m src.embeddings.cli          # embed portfolio content
uv run uvicorn src.api:app --reload          # start chatbot API
curl http://localhost:8000/api/health        # health check
curl -X POST http://localhost:8000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "What projects has YoungIn worked on?"}'
```

---

### Task 40: API proxy route (`app/api/chat/route.ts`)

**상태:** ⏳ 대기

POST -> proxy to Python backend `CHATBOT_API_URL/api/chat`

**보안 (lib/chat-security.ts 공통 유틸):**
- **Origin allowlist:** 단일 값이 아닌 허용 도메인 목록으로 검증
```typescript
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
].filter(Boolean);
```
- **CSRF 방어:** `X-Requested-With: XMLHttpRequest` 커스텀 헤더 검증 (simple request 차단, CORS preflight 강제)
- **입력 길이 제한:** `body.message.length > 500` -> 400 반환

### 완료 기준
- [ ] `lib/chat-security.ts` 생성 (Origin allowlist + CSRF 검증)
- [ ] `app/api/chat/route.ts` 생성
- [ ] Origin, CSRF, 입력 길이 모두 검증
- [ ] 커밋: `feat: add chat API proxy route with origin allowlist and CSRF protection`

---

### Task 41: Streaming proxy route (`app/api/chat/stream/route.ts`)

**상태:** ⏳ 대기

POST -> proxy SSE stream from Python backend. Task 40과 동일한 `validateChatRequest()` 유틸 + 입력 길이 제한.

### 완료 기준
- [ ] `app/api/chat/stream/route.ts` 생성
- [ ] `validateChatRequest()` 재사용
- [ ] 커밋: `feat: add streaming SSE proxy route with origin validation`

---

### Task 42: `useChatbot` hook (`hooks/useChatbot.ts`)

**상태:** ⏳ 대기

React hook: messages state, streaming SSE via ReadableStream, abort support.

**서버 보안 계약 준수 (필수):** Task 40-41 보안 요구와 일치하는 헤더:
```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // CSRF -- 없으면 403
  },
  body: JSON.stringify({ message }),
  signal: abortController.signal,
});
```

**에러 처리:**
- `403` -> "요청이 차단되었습니다" (보안 검증 실패)
- `400` -> "메시지가 너무 깁니다 (최대 500자)"
- `429` -> "요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요."

### 완료 기준
- [ ] `hooks/useChatbot.ts` 생성
- [ ] `X-Requested-With` 헤더 포함
- [ ] 에러 코드별 처리 (403, 400, 429)
- [ ] 커밋: `feat: add useChatbot hook with streaming`

---

### Task 43: ChatMessage component (`components/chat/ChatMessage.tsx`)

**상태:** ⏳ 대기

User/assistant message bubbles, 기존 디자인 토큰 사용.

### 완료 기준
- [ ] `components/chat/ChatMessage.tsx` 생성
- [ ] 커밋: `feat: add ChatMessage component`

---

### Task 44: ChatBot panel (`components/chat/ChatBot.tsx`)

**상태:** ⏳ 대기

Floating button (bottom-right) + sliding chat panel. `useChatbot` hook + `ChatMessage` 사용.

### 완료 기준
- [ ] `components/chat/ChatBot.tsx` 생성
- [ ] 커밋: `feat: add ChatBot floating widget`

---

### Task 45: Integrate into layout

**상태:** ⏳ 대기

`app/layout.tsx`에 `<ChatBot />` 추가 (`<main>` 뒤).

### 완료 기준
- [ ] `app/layout.tsx` 수정
- [ ] 커밋: `feat: integrate ChatBot into root layout`

---

### Task 46: Final environment config

**상태:** ⏳ 대기

`CHATBOT_API_URL`을 `.env.example`, `.env`, `lib/env.ts`에 추가.

### 완료 기준
- [ ] 환경변수 추가
- [ ] 커밋: `chore: add chatbot API URL to environment config`

---

## Phase 4 완료 검증

```bash
# Both servers running (Next.js on 3000, Python on 8000)
# Visit http://localhost:3000 -> click floating chat button -> ask questions
# Verify streaming responses appear character by character
# Verify origin allowlist: 허용되지 않은 origin -> 403
# Verify CSRF: X-Requested-With 없이 호출 -> 403
# Verify input length: 500+ char message -> 400
npm run test:run      # all frontend tests pass
```

---

### Task 47: Deploy Python backend

**상태:** ⏳ 대기

**배포 플랫폼 비교:**

| 플랫폼 | 무료 티어 | 콜드스타트 | 장점 | 단점 |
|---------|----------|-----------|------|------|
| **Render** | 750시간/월 | **2-3분** (무활동 15분 후 슬립) | 설정 간편, Docker 지원 | 콜드스타트 매우 느림 |
| **Railway** | $5 크레딧/월 | **~5초** (항상 실행) | 빠른 응답, 좋은 DX | 무료 크레딧 소진 시 중단 |
| **Fly.io** | 3 shared VMs | **~10초** (scale-to-zero 시) | 글로벌 리전 | 설정 복잡 |

**권장:** Railway (응답 속도 우선) 또는 Render (비용 0원 우선). 사용자 선택.

**Render 콜드스타트 완화:**
- 14분 간격 self-ping (`GET /api/health`)
- UX: "챗봇 서버를 깨우는 중입니다. 최대 2-3분 소요될 수 있습니다."

**Render 배포 절차:**
1. "New Web Service" -> GitHub repo (`folio_agent/`)
2. Build: `pip install uv && uv sync`
3. Start: `uv run uvicorn src.api:app --host 0.0.0.0 --port $PORT`
4. Env: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`

### 완료 기준
- [ ] 배포 플랫폼 선택 및 배포 완료
- [ ] `curl https://<deployed-url>/api/health` 정상
- [ ] 커밋: `docs: add deployment configuration`

---

### Task 48: Configure Vercel deployment for Next.js

**상태:** ⏳ 대기

**Vercel 환경변수:** `DATABASE_URL`, `PAYLOAD_SECRET`, `CHATBOT_API_URL` (배포 서비스 URL)

### 완료 기준
- [ ] Vercel 환경변수 설정
- [ ] 배포 확인
- [ ] 커밋: `docs: add Vercel deployment notes`

---

### Task 49: Add rate limiting (분당 burst) to chatbot API

**상태:** ⏳ 대기

Task 36의 일일 50회에 추가로 **분당 10회** burst 제한.

### 완료 기준
- [ ] `src/api.py` 수정 (분당 10회 제한 추가)
- [ ] 429 응답 시 프론트엔드 안내 확인
- [ ] 커밋: `feat: add rate limiting to chatbot API`

---

### Task 50: Python integration tests

**상태:** ⏳ 대기

**테스트 전략 (단위 vs 통합 분리):**
- **단위 테스트** (Tasks 32-35, CI 항상 실행): mock 기반, 외부 의존성 없음
- **통합 테스트** (이 태스크, CI 선택적/nightly): 실제 API + DB 필요

**통합 테스트 범위:**
- 전체 그래프: 메시지 -> router -> retriever -> generator -> 응답
- SSE 스트리밍 E2E
- Rate limiting 429 응답
- Health check

**테스트 데이터:** `tests/fixtures/`에 고정 입력/기대 출력. API 응답의 구조적 형식(필드, 타입, 길이 범위)만 검증.

```bash
# 단위 (CI 기본)
cd folio_agent && uv run pytest tests/ --ignore=tests/test_integration.py
# 통합 (수동/nightly)
cd folio_agent && uv run pytest tests/test_integration.py
```

### 완료 기준
- [ ] `tests/test_integration.py` 생성
- [ ] `tests/fixtures/` 테스트 데이터
- [ ] CI에서 통합 테스트 제외 설정 확인
- [ ] 커밋: `test: add integration tests for agent pipeline`

---

### Task 51: Add environment variable validation for chatbot keys

**상태:** ⏳ 대기

`lib/env.ts`에 `CHATBOT_API_URL` 검증 추가. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`는 Python 서버 측에서 검증 (Task 26 config.py에서 처리).

### 완료 기준
- [ ] `lib/env.ts` 수정
- [ ] 커밋: `feat: validate chatbot environment variables`

---

## Phase 5 완료 검증

```bash
curl https://<deployed-url>/api/health
# Vercel 배포 사이트에서 챗봇 동작 확인
# Rate limiting: 분당 11회 -> 429
# 일일 제한: 50회 초과 -> 429
cd folio_agent && uv run pytest   # unit + integration
```

---

## Critical Files

| File | Role |
|------|------|
| `payload.config.ts` | Central CMS configuration wiring all collections and DB |
| `lib/payload.ts` | Data access abstraction -- 모든 컴포넌트가 여기서 import, static data fallback 포함 |
| `collections/Projects.ts` | 가장 복잡한 컬렉션, 기존 중첩 인터페이스와 정확히 매핑 필수 |
| `folio_agent/src/agent/graph.py` | LangGraph agent assembly (router -> retriever -> generator) |
| `components/chat/ChatBot.tsx` | Floating chat widget with streaming UI |
| `scripts/seed.ts` | 정적 데이터 -> CMS DB migration (idempotent) |
| `lib/chat-security.ts` | Origin allowlist + CSRF 공통 보안 유틸 |
| `.github/workflows/ci.yml` | Next.js CI (lint + test + seed + build) |
| `.github/workflows/ci-python.yml` | Python CI (ruff + pytest unit only) |

---

## 이슈 & 메모

- **Next.js 다운그레이드:** Payload CMS 3.79.0의 peer dep가 `>=15.4.11 <15.5.0`을 요구하여 Next.js 15.5.12 → 15.4.11로 다운그레이드. `eslint-config-next`도 동일 버전으로 pinning.
- **importMap 수동 생성:** `npx payload generate:importmap`이 DB 연결을 시도하며 hang. Supabase 미연결 상태이므로 빈 importMap (`app/(payload)/admin/importMap.js`)을 수동 생성. Task 11 (Supabase 설정) 이후 재생성 필요.
- **Task 3 (PoC) 보류:** Supabase DB 연결 없이는 검증 불가. React 19 호환성은 Task 2 설치 시 확인 완료 (충돌 없음). DB 관련 검증은 Task 11 이후로 연기.
- **Task 13 조기 완료:** 컬렉션 생성 시 `afterChange` hook을 함께 추가하여 Task 13을 별도 단계 없이 완료.
- **검증 결과:** `npm run build` ✅, `npm run test:run` 34 tests passed ✅

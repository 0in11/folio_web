# Portfolio Website 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Execution Rule:** 각 Task는 `구현 → 검증 → 커밋` 순서로 진행하고, 다음 Task로 넘어가기 전에 테스트/빌드 통과를 확인한다.

**Goal:** Jin YoungIn AI 엔지니어 포트폴리오 웹사이트를 Next.js 15 기반으로 처음부터 완전히 구축한다.

**Architecture:** SSG 중심의 Next.js 15 App Router. 데이터는 TypeScript 파일로 관리. Tailwind CSS로 PRD 디자인 토큰 구현. Framer Motion으로 절제된 인터랙션. Vitest + React Testing Library로 컴포넌트 및 유틸리티 테스트.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v3 (`tailwind.config.ts` 기반), Framer Motion, Lucide React, next/font (Syne + Plus Jakarta Sans + JetBrains Mono), Vitest + React Testing Library

**Package Manager:**
- Next.js (Node.js): `npm`
- Python 스크립트/툴링: `uv` — `pyproject.toml`로 Python 도구 및 스크립트 의존성 관리

**Tailwind 버전:** v3 고정 (`tailwindcss@^3`). v4는 CSS-first 방식으로 `tailwind.config.ts`와 호환되지 않으므로 사용하지 않는다. Task 1 Step 3에서 명시적으로 v3를 설치한다.

---

## Context

현재 `/Users/0in11/Desktop/folio_web`에는 `docs/PRD.md`만 존재하며 코드가 전혀 없다.
PRD v2.0 기준으로 완전 신규 구축이 목표다.

**브랜드 방향**: "Engineered Clarity" — 절제된 다크 테마, 강한 타이포그래피, 정돈된 그리드
**피해야 할 것**: 과도한 글래스모피즘, 네온, 파티클, 섹션마다 다른 애니메이션

---

## Task 0: UV Python 환경 설정

**Files:**
- Create: `pyproject.toml`
- Create: `scripts/` 디렉토리 (Python 스크립트 모음)

**목적:** 향후 Python 스크립트(컨텐츠 자동화, 데이터 갱신, 배포 헬퍼 등)를 UV로 관리할 수 있도록 기반을 잡아둔다. Next.js 코드와는 완전히 분리된다.

**Step 1: UV 설치 확인**

Run: `uv --version`
Expected: UV 버전 출력 (미설치 시 `curl -LsSf https://astral.sh/uv/install.sh | sh`)

**Step 2: pyproject.toml 작성**

```toml
[project]
name = "folio-scripts"
version = "0.1.0"
description = "Python scripts for portfolio automation"
requires-python = ">=3.11"
dependencies = []

[tool.uv]
dev-dependencies = [
  "httpx>=0.27",      # API 요청 (GitHub 등)
  "rich>=13.0",       # 터미널 출력 포매팅
]
```

**Step 3: 가상환경 초기화**

Run: `uv sync`
Expected: `.venv/` 생성, 의존성 설치 완료

**Step 4: .gitignore에 Python 관련 항목 추가**

Next.js 초기화 후 `.gitignore`에 아래 항목이 없으면 추가:
```
# Python
.venv/
__pycache__/
*.pyc
```

**Step 5: 커밋**

```bash
git add pyproject.toml uv.lock scripts/
git commit -m "chore: add UV Python environment for scripting and automation"
```

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.eslintrc.json`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Step 1: 기존 디렉토리 확인**

Run: `ls /Users/0in11/Desktop/folio_web`
Expected: `docs/` 폴더만 존재

**Step 2: Next.js 프로젝트 초기화**

Run:
```bash
cd /Users/0in11/Desktop/folio_web && npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-turbopack
```
Expected: 패키지 설치 완료, `package.json` 생성됨

**Step 3: 추가 패키지 설치**

Run:
```bash
npm install framer-motion lucide-react clsx tailwind-merge
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Run: `npm install tailwindcss@^3`
Expected: tailwindcss v3.x 설치됨 (`npm ls tailwindcss`로 확인)

**Step 4: 기본 동작 확인**

Run: `npm run build`
Expected: `.next/` 폴더 생성, 에러 없음

**Step 5: 커밋**

```bash
git add -A
git commit -m "chore: initialize Next.js 15 project with TypeScript, Tailwind, and test dependencies"
```

---

## Task 2: 디자인 토큰 & Tailwind 설정

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Step 1: tailwind.config.ts에 PRD 색상 팔레트 및 타이포 추가**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0F",
          secondary: "#12121A",
          surface: "#171722",
          hover: "#1D1D2B",
        },
        accent: {
          primary: "#60A5FA",
          secondary: "#818CF8",
        },
        "text-primary": "#F1F5F9",
        "text-secondary": "#A8B3C7",
        "text-muted": "#64748B",
        "border-subtle": "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        success: "#34D399",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      maxWidth: {
        content: "1280px",
        article: "768px",
      },
      borderRadius: {
        card: "16px",
      },
      spacing: {
        section: "6rem",
        "section-mobile": "4.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: globals.css에 기본 스타일 설정**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-primary text-text-primary font-sans antialiased;
  }

  * {
    @apply border-border-subtle;
  }

  ::selection {
    @apply bg-accent-primary/20 text-accent-primary;
  }

  :focus-visible {
    @apply outline-2 outline-offset-2 outline-accent-primary;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 3: 빌드 확인**

Run: `npm run build`
Expected: 에러 없음

**Step 4: 커밋**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: add design tokens and Tailwind configuration from PRD"
```

---

## Task 3: Vitest 테스트 환경 설정

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (test 스크립트 추가)

**Step 1: vitest.config.ts 작성**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "app/layout.tsx",
        "app/page.tsx",
        "**/*.config.*",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

**Step 2: vitest.setup.ts 작성**

```typescript
// vitest.setup.ts
import "@testing-library/jest-dom";
```

**Step 3: package.json에 test 스크립트 추가**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Step 4: 테스트 환경 동작 확인**

Run: `npm run test:run`
Expected: "No test files found" (정상 - 아직 테스트 없음)

**Step 5: 커밋**

```bash
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore: configure Vitest with React Testing Library and jsdom"
```

---

## Task 4: 데이터 파일 정의

**Files:**
- Create: `data/projects.ts`
- Create: `data/career.ts`
- Create: `data/skills.ts`
- Create: `data/education.ts`
- Create: `data/awards.ts`
- Create: `data/index.ts`
- Create: `__tests__/data/projects.test.ts`

**Step 1: 테스트 먼저 작성**

```typescript
// __tests__/data/projects.test.ts
import { describe, it, expect } from "vitest";
import { projects, getFeaturedProjects, getProjectBySlug } from "@/data/projects";

describe("projects data", () => {
  it("최소 3개 이상의 프로젝트가 있어야 한다", () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  it("featured 프로젝트가 정확히 3개여야 한다", () => {
    const featured = getFeaturedProjects();
    expect(featured).toHaveLength(3);
  });

  it("모든 프로젝트에 필수 필드가 있어야 한다", () => {
    projects.forEach((project) => {
      expect(project.id).toBeTruthy();
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.company).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.technologies).toBeInstanceOf(Array);
      expect(project.technologies.length).toBeGreaterThan(0);
    });
  });

  it("slug로 프로젝트를 찾을 수 있어야 한다", () => {
    const first = projects[0];
    const found = getProjectBySlug(first.slug);
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
  });

  it("존재하지 않는 slug는 undefined를 반환해야 한다", () => {
    const result = getProjectBySlug("non-existent-slug");
    expect(result).toBeUndefined();
  });
});
```

**Step 2: 테스트 실패 확인**

Run: `npm run test:run`
Expected: FAIL - "Cannot find module @/data/projects"

**Step 3: data/projects.ts 작성 (실제 Featured 3개 + 플레이스홀더 6개)**

```typescript
// data/projects.ts

export interface ProjectDetail {
  problem: string;
  role: string;
  architecture: string;
  implementation: string;
  impact: string;
  learnings: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  company: string;
  description: string;
  period: string;
  teamSize: string;
  technologies: string[];
  keyAchievement: string;
  featured: boolean;
  detail?: ProjectDetail;
  links?: {
    github?: string;
    demo?: string;
    paper?: string;
  };
}

export const projects: Project[] = [
  // ─── Featured Projects ───────────────────────────────────────────
  {
    id: "graphrag-maritime",
    slug: "graphrag-maritime-law",
    title: "해양 법령 GraphRAG 시스템",
    company: "SURESOFT",
    description:
      "복잡한 해양 법령 체계를 Knowledge Graph로 구조화하고, GraphRAG 기반 정확한 법령 조회 시스템을 구축했습니다.",
    period: "2025.09 – 2025.12",
    teamSize: "3인",
    technologies: ["Python", "LangGraph", "Neo4j", "ElasticSearch", "FastAPI"],
    keyAchievement: "법령 간 관계 기반 조회로 기존 키워드 검색 대비 정확도 향상",
    featured: true,
    detail: {
      problem:
        "해양 법령은 수백 개의 법률·시행령·고시가 서로 참조하는 복잡한 계층 구조를 가집니다. 단순 키워드 검색으로는 관련 법령 전체를 빠짐없이 조회하기 어렵습니다.",
      role: "시스템 아키텍처 설계, Knowledge Graph 구축 파이프라인 구현, GraphRAG 쿼리 엔진 개발 담당",
      architecture:
        "법령 원문을 파싱해 Neo4j에 그래프로 적재하고, ElasticSearch로 하이브리드 검색을 구성. LangGraph로 멀티스텝 검색 에이전트를 오케스트레이션.",
      implementation:
        "Challenge: 법령 참조 관계를 자동 파싱하는 것이 어려웠음.\n\nDecision: 정규식 기반 파서 대신 LLM-assisted 파싱 파이프라인을 설계해 모호한 참조 처리.\n\nResult: 법령 간 관계 그래프 자동 구축 성공, 다단계 참조 추적 쿼리 가능.",
      impact:
        "복잡한 법령 조회 소요 시간 단축. 관련 법령 누락률 감소.",
      learnings:
        "구조화된 도메인 지식은 그래프 DB가 효과적임. LLM 기반 파싱은 규칙 기반 대비 유지보수성 높음.",
    },
  },
  {
    id: "on-premise-chatbot",
    slug: "on-premise-chatbot",
    title: "On-Premise RAG 챗봇",
    company: "KoDATA",
    description:
      "외부 API 없이 온프레미스 환경에서 동작하는 내부 문서 기반 RAG 챗봇을 설계·구축했습니다.",
    period: "2025.03 – 2025.09",
    teamSize: "2인",
    technologies: ["Python", "LangChain", "vLLM", "FastAPI", "PostgreSQL", "Docker"],
    keyAchievement: "외부 인터넷 차단 환경에서 완전 동작하는 엔터프라이즈 RAG 시스템 구축",
    featured: true,
    detail: {
      problem:
        "금융 데이터 특성상 외부 클라우드 LLM API 사용이 불가. 내부 서버에서 완전히 동작하는 AI 시스템이 필요했습니다.",
      role: "전체 시스템 아키텍처 설계, 로컬 LLM 서빙(vLLM), RAG 파이프라인 구현, FastAPI 백엔드 개발",
      architecture:
        "vLLM으로 로컬 LLM 서빙 → LangChain RAG 파이프라인 → PostgreSQL + pgvector 벡터 스토어 → FastAPI 백엔드 → 내부 웹 UI.",
      implementation:
        "Challenge: 제한된 GPU 메모리에서 성능을 유지해야 했음.\n\nDecision: 양자화(GPTQ)와 sliding window attention 조합으로 메모리 최적화.\n\nResult: 16GB VRAM 환경에서 70B 모델 서빙 성공.",
      impact:
        "문서 검색 소요 시간 대폭 단축. 직원 정보 접근성 향상.",
      learnings:
        "On-premise LLM 운용은 서빙 최적화가 핵심. pgvector가 별도 벡터 DB 없이도 충분히 효과적.",
    },
  },
  {
    id: "domain-sllm",
    slug: "domain-specific-sllm",
    title: "도메인 특화 sLLM 개발",
    company: "SURESOFT",
    description:
      "소프트웨어 검증 도메인에 특화된 소형 언어 모델(sLLM)을 파인튜닝하고 평가 파이프라인을 구축했습니다.",
    period: "2025.12 – 진행 중",
    teamSize: "3인",
    technologies: ["Python", "LLaMA", "llama.cpp", "LoRA", "vLLM", "FastAPI"],
    keyAchievement: "도메인 데이터 기반 파인튜닝으로 일반 모델 대비 도메인 정확도 향상",
    featured: true,
    detail: {
      problem:
        "범용 LLM은 소프트웨어 검증 도메인 특화 지식이 부족해 실무 적용이 어려웠습니다.",
      role: "학습 데이터 구축, LoRA 파인튜닝 파이프라인 설계, 평가 지표 정의 및 자동화 담당",
      architecture:
        "도메인 데이터 수집·정제 → LoRA 기반 파인튜닝 → llama.cpp 양자화 → vLLM 서빙 → 자동 평가 파이프라인.",
      implementation:
        "Challenge: 도메인 특화 평가 기준 정립이 어려웠음.\n\nDecision: ROUGE/BLEU 외 도메인 전문가 정의 기준으로 LLM-as-Judge 평가 방식 도입.\n\nResult: 일관된 도메인 벤치마크 구축, 파인튜닝 전후 성능 비교 자동화.",
      impact: "도메인 쿼리 정확도 향상. 반복적 모델 개선 사이클 단축.",
      learnings:
        "도메인 특화 평가 지표 없이 파인튜닝은 의미 없음. 데이터 품질 > 데이터 양.",
    },
  },

  // ─── More Projects (플레이스홀더) ────────────────────────────────
  {
    id: "placeholder-1",
    slug: "project-4",
    title: "프로젝트 4",
    company: "회사명",
    description: "프로젝트 설명을 추가해주세요.",
    period: "2025.xx – 2025.xx",
    teamSize: "x인",
    technologies: ["Python", "LangChain"],
    keyAchievement: "주요 성과를 추가해주세요.",
    featured: false,
  },
  {
    id: "placeholder-2",
    slug: "project-5",
    title: "프로젝트 5",
    company: "회사명",
    description: "프로젝트 설명을 추가해주세요.",
    period: "2025.xx – 2025.xx",
    teamSize: "x인",
    technologies: ["Python", "FastAPI"],
    keyAchievement: "주요 성과를 추가해주세요.",
    featured: false,
  },
  {
    id: "placeholder-3",
    slug: "project-6",
    title: "프로젝트 6",
    company: "회사명",
    description: "프로젝트 설명을 추가해주세요.",
    period: "2025.xx – 2025.xx",
    teamSize: "x인",
    technologies: ["Python", "Docker"],
    keyAchievement: "주요 성과를 추가해주세요.",
    featured: false,
  },
  {
    id: "text2vr",
    slug: "text2vr",
    title: "Text2VR",
    company: "상명대학교 연구",
    description:
      "단일 텍스트 프롬프트에서 VR 장면을 생성하는 모듈형 파이프라인 연구 프로젝트.",
    period: "2024.xx – 2025.xx",
    teamSize: "3인",
    technologies: ["Python", "Stable Diffusion", "Three.js"],
    keyAchievement: "KCI 등재 논문으로 발표",
    featured: false,
    links: {
      paper: "https://doi.org/...",
    },
  },
  {
    id: "placeholder-5",
    slug: "project-8",
    title: "프로젝트 8",
    company: "회사명",
    description: "프로젝트 설명을 추가해주세요.",
    period: "2024.xx – 2024.xx",
    teamSize: "x인",
    technologies: ["Python"],
    keyAchievement: "주요 성과를 추가해주세요.",
    featured: false,
  },
  {
    id: "placeholder-6",
    slug: "project-9",
    title: "프로젝트 9",
    company: "회사명",
    description: "프로젝트 설명을 추가해주세요.",
    period: "2024.xx – 2024.xx",
    teamSize: "x인",
    technologies: ["Python"],
    keyAchievement: "주요 성과를 추가해주세요.",
    featured: false,
  },
];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getMoreProjects(): Project[] {
  return projects.filter((p) => !p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
```

**Step 4: data/career.ts 작성**

```typescript
// data/career.ts
export interface CareerItem {
  period: string;
  company: string;
  role: string;
  keywords: string[];
  current?: boolean;
}

export const careerHistory: CareerItem[] = [
  {
    period: "2025.12 –",
    company: "슈어소프트테크",
    role: "전임연구원",
    keywords: ["GraphRAG", "sLLM", "LangGraph"],
    current: true,
  },
  {
    period: "2025.09 – 2025.12",
    company: "슈어소프트테크",
    role: "인턴",
    keywords: ["GraphRAG", "Domain LLM"],
  },
  {
    period: "2025.03 – 2025.09",
    company: "한국평가데이터",
    role: "인턴",
    keywords: ["RAG", "On-Premise LLM", "FastAPI"],
  },
];
```

**Step 5: data/skills.ts 작성**

```typescript
// data/skills.ts
export interface SkillGroup {
  label: string;
  description: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Core Stack",
    description: "실무에서 주로 사용하는 기술",
    items: [
      "Python", "FastAPI", "LangGraph", "LangChain",
      "vLLM", "ElasticSearch", "PostgreSQL", "Docker", "Linux",
    ],
  },
  {
    label: "Worked With",
    description: "프로젝트에서 경험한 기술",
    items: [
      "TypeScript", "React", "Svelte", "Node.js", "Redis",
      "SQLite", "Neo4j", "llama.cpp", "FastMCP", "Tkinter",
    ],
  },
  {
    label: "Tooling & Environment",
    description: "개발 환경 및 운용",
    items: [
      "Git", "Docker", "Linux", "On-premise",
      "API Integration", "Eval / Automation Pipelines",
    ],
  },
];
```

**Step 6: data/education.ts 작성**

```typescript
// data/education.ts
export interface Education {
  institution: string;
  degree: string;
  gpa?: string;
  period: string;
}

export interface Certification {
  name: string;
  date: string;
  issuer?: string;
}

export const education: Education[] = [
  {
    institution: "상명대학교",
    degree: "휴먼지능정보공학과",
    gpa: "4.1 / 4.5",
    period: "2020 – 2026",
  },
];

export const certifications: Certification[] = [
  {
    name: "AWS Certified AI Practitioner",
    date: "2026.02",
    issuer: "Amazon Web Services",
  },
  {
    name: "정보처리기능사",
    date: "2023.06",
    issuer: "한국산업인력공단",
  },
  {
    name: "OPIc IM2",
    date: "2025.09",
    issuer: "ACTFL",
  },
];
```

**Step 7: data/awards.ts 작성**

```typescript
// data/awards.ts
export interface Award {
  title: string;
  date: string;
  organizer?: string;
}

export interface Publication {
  title: string;
  journal: string;
  year: number;
  doi?: string;
}

export const awards: Award[] = [
  {
    title: "SW중심대학사업 AI·클라우드 공모전 우수상",
    date: "2024.05",
    organizer: "SW중심대학사업단",
  },
  {
    title: "Human AI Studio Festival 2025 우수상",
    date: "2025.11",
    organizer: "Human AI Studio",
  },
];

export const publications: Publication[] = [
  {
    title: "Text2VR: 단일 텍스트 프롬프트 기반 VR 장면 생성 모듈형 파이프라인",
    journal: "한국정보과학회 (KCI 등재)",
    year: 2025,
    doi: "https://doi.org/...",
  },
];
```

**Step 8: data/index.ts (배럴 익스포트)**

```typescript
// data/index.ts
export * from "./projects";
export * from "./career";
export * from "./skills";
export * from "./education";
export * from "./awards";
```

**Step 9: 테스트 실행**

Run: `npm run test:run`
Expected: PASS - 모든 데이터 테스트 통과

**Step 10: 커밋**

```bash
git add data/ __tests__/
git commit -m "feat: add typed data files for projects, career, skills, education, and awards"
```

---

## Task 5: lib 유틸리티 함수

**Files:**
- Create: `lib/utils.ts`
- Create: `__tests__/lib/utils.test.ts`

**Step 1: 테스트 먼저 작성**

```typescript
// __tests__/lib/utils.test.ts
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
```

**Step 2: 테스트 실패 확인**

Run: `npm run test:run`
Expected: FAIL - "Cannot find module @/lib/utils"

**Step 3: lib/utils.ts 구현**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Step 4: 테스트 통과 확인**

Run: `npm run test:run`
Expected: PASS

**Step 5: 커밋**

```bash
git add lib/ __tests__/lib/
git commit -m "feat: add cn utility for Tailwind class merging"
```

---

## Task 6: 폰트 & 레이아웃 (app/layout.tsx)

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/MobileMenu.tsx`
- Create: `__tests__/components/layout/Header.test.tsx`

**Step 1: Header 테스트 먼저 작성**

```typescript
// __tests__/components/layout/Header.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Header from "@/components/layout/Header";

describe("Header", () => {
  it("사이트 로고/이름이 렌더링 되어야 한다", () => {
    render(<Header />);
    expect(screen.getByText(/YIN/i)).toBeInTheDocument();
  });

  it("네비게이션 링크가 있어야 한다", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /career/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("접근 가능한 nav 랜드마크가 있어야 한다", () => {
    render(<Header />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
```

**Step 2: app/layout.tsx에 폰트 설정**

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "700", "800"],
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jin YoungIn | AI Engineer Portfolio",
  description:
    "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Jin YoungIn Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${syne.variable} ${jakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**Step 3: components/layout/Header.tsx 구현**

```typescript
// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Career", href: "#career" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Awards", href: "#awards" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-bg-primary/90 backdrop-blur-sm border-b border-border-subtle"
          : "bg-transparent"
      )}
    >
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-bold text-lg tracking-tight text-text-primary hover:text-accent-primary transition-colors"
          aria-label="홈으로"
        >
          YIN
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="메인 네비게이션" className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMenuOpen(true)}
          aria-label="메뉴 열기"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">메뉴</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
      />
    </header>
  );
}
```

**Step 4: components/layout/MobileMenu.tsx 구현**

```typescript
// components/layout/MobileMenu.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string }>;
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="모바일 메뉴"
    >
      <div className="flex justify-end p-6">
        <button
          onClick={onClose}
          aria-label="메뉴 닫기"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col items-center justify-center flex-1 gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-display text-3xl font-bold text-text-primary hover:text-accent-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

**Step 5: 테스트 통과 확인**

Run: `npm run test:run`
Expected: PASS

**Step 6: 커밋**

```bash
git add app/layout.tsx components/layout/ __tests__/components/layout/
git commit -m "feat: add font config, Header with scroll effect, and mobile menu overlay"
```

---

## Task 7: Hero Section

**Files:**
- Create: `components/sections/HeroSection.tsx`
- Create: `__tests__/components/sections/HeroSection.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/components/sections/HeroSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeroSection from "@/components/sections/HeroSection";

describe("HeroSection", () => {
  it("이름이 렌더링되어야 한다", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Jin YoungIn/i)).toBeInTheDocument();
  });

  it("역할 소개가 렌더링되어야 한다", () => {
    render(<HeroSection />);
    expect(screen.getByText(/AI Engineer/i)).toBeInTheDocument();
  });

  it("CTA 링크가 2개 있어야 한다", () => {
    render(<HeroSection />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("h1 태그가 있어야 한다", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
```

**Step 2: HeroSection 구현**

```typescript
// components/sections/HeroSection.tsx
"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center px-6 pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-content mx-auto w-full">
        {/* Eyebrow */}
        <p className="font-mono text-sm text-accent-primary tracking-widest uppercase mb-6">
          AI Engineer
        </p>

        {/* Name */}
        <h1
          id="hero-heading"
          className="font-display text-6xl md:text-8xl font-bold text-text-primary leading-none tracking-tight mb-6"
        >
          Jin YoungIn
          <span className="block text-text-muted text-5xl md:text-7xl mt-2">
            진영인
          </span>
        </h1>

        {/* Role Description */}
        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-4 leading-relaxed">
          Building production-ready{" "}
          <span className="text-accent-primary">RAG, agents</span>, and{" "}
          <span className="text-accent-primary">domain LLM systems</span>{" "}
          that solve real problems.
        </p>

        <p className="text-base text-text-muted max-w-xl mb-12 leading-relaxed">
          도메인 지식을 실제 작동하는 AI 시스템으로 연결하는 엔지니어.
          LLMOps부터 온프레미스 서빙까지.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="#projects"
            className="inline-flex items-center gap-2 bg-accent-primary text-bg-primary px-6 py-3 rounded-card font-medium text-sm hover:bg-accent-primary/90 transition-colors"
          >
            Selected Projects
            <ArrowRight size={16} />
          </Link>
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 border border-border-strong text-text-primary px-6 py-3 rounded-card font-medium text-sm hover:bg-bg-surface transition-colors"
          >
            Resume
            <Download size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: 테스트 통과 확인**

Run: `npm run test:run`
Expected: PASS

**Step 4: app/page.tsx에 HeroSection 추가 (임시)**

```typescript
// app/page.tsx
import HeroSection from "@/components/sections/HeroSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
    </>
  );
}
```

**Step 5: 커밋**

```bash
git add components/sections/HeroSection.tsx app/page.tsx __tests__/
git commit -m "feat: implement Hero section with name, role description, and CTAs"
```

---

## Task 8: ProjectCard UI + Selected Projects Section

**Files:**
- Create: `components/ui/ProjectCard.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/sections/ProjectsSection.tsx`
- Create: `__tests__/components/ui/ProjectCard.test.tsx`
- Create: `__tests__/components/sections/ProjectsSection.test.tsx`

**Step 1: Badge 컴포넌트 (테스트 없이 단순 UI)**

```typescript
// components/ui/Badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-xs text-text-muted px-2 py-0.5 rounded bg-bg-surface border border-border-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}
```

**Step 2: ProjectCard 테스트**

```typescript
// __tests__/components/ui/ProjectCard.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/data/projects";

const mockProject: Project = {
  id: "test-1",
  slug: "test-project",
  title: "테스트 프로젝트",
  company: "테스트 회사",
  description: "테스트 설명입니다.",
  period: "2025.01 – 2025.06",
  teamSize: "3인",
  technologies: ["Python", "FastAPI"],
  keyAchievement: "주요 성과",
  featured: false,
};

describe("ProjectCard", () => {
  it("프로젝트 제목이 렌더링되어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("테스트 프로젝트")).toBeInTheDocument();
  });

  it("회사명이 렌더링되어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("테스트 회사")).toBeInTheDocument();
  });

  it("기술 스택 뱃지가 렌더링되어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
  });

  it("상세 보기 링크가 있어야 한다", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/test-project");
  });
});
```

**Step 3: ProjectCard 구현**

```typescript
// components/ui/ProjectCard.tsx
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Badge from "./Badge";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group block rounded-card border border-border-subtle bg-bg-surface p-6",
        "hover:border-border-strong hover:bg-bg-hover transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        featured && "md:p-8"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-mono text-xs text-text-muted mb-1">{project.company}</p>
          <h3 className={cn(
            "font-display font-bold text-text-primary group-hover:text-accent-primary transition-colors",
            featured ? "text-xl" : "text-lg"
          )}>
            {project.title}
          </h3>
        </div>
        <ArrowUpRight
          size={18}
          className="text-text-muted group-hover:text-accent-primary transition-colors flex-shrink-0 mt-1"
        />
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Achievement */}
      <p className="text-xs text-success mb-4 font-medium">
        → {project.keyAchievement}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-text-muted font-mono">{project.period}</span>
        <span className="text-text-muted">·</span>
        <span className="text-xs text-text-muted font-mono">{project.teamSize}</span>
      </div>

      {/* Tech Badges */}
      <div className="flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 5).map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
    </Link>
  );
}
```

**Step 4: ProjectsSection 테스트**

```typescript
// __tests__/components/sections/ProjectsSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProjectsSection from "@/components/sections/ProjectsSection";

describe("ProjectsSection", () => {
  it("섹션 제목이 있어야 한다", () => {
    render(<ProjectsSection />);
    expect(screen.getByRole("heading", { name: /selected projects/i })).toBeInTheDocument();
  });

  it("Featured 프로젝트 3개가 렌더링되어야 한다", () => {
    render(<ProjectsSection />);
    expect(screen.getByText("해양 법령 GraphRAG 시스템")).toBeInTheDocument();
    expect(screen.getByText("On-Premise RAG 챗봇")).toBeInTheDocument();
    expect(screen.getByText("도메인 특화 sLLM 개발")).toBeInTheDocument();
  });
});
```

**Step 5: ProjectsSection 구현**

```typescript
// components/sections/ProjectsSection.tsx
import ProjectCard from "@/components/ui/ProjectCard";
import { getFeaturedProjects, getMoreProjects } from "@/data/projects";

export default function ProjectsSection() {
  const featured = getFeaturedProjects();
  const more = getMoreProjects();

  return (
    <section id="projects" className="py-section px-6" aria-labelledby="projects-heading">
      <div className="max-w-content mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Work
          </p>
          <h2 id="projects-heading" className="font-display text-4xl md:text-5xl font-bold text-text-primary">
            Selected Projects
          </h2>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>

        {/* More Projects */}
        {more.length > 0 && (
          <>
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-text-secondary">
                More Projects
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {more.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
```

**Step 6: 테스트 통과 확인**

Run: `npm run test:run`
Expected: PASS

**Step 7: 커밋**

```bash
git add components/ui/ components/sections/ProjectsSection.tsx __tests__/
git commit -m "feat: implement ProjectCard and ProjectsSection with featured/more grid layout"
```

---

## Task 9: Career Snapshot Section

**Files:**
- Create: `components/sections/CareerSection.tsx`
- Create: `__tests__/components/sections/CareerSection.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/components/sections/CareerSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CareerSection from "@/components/sections/CareerSection";

describe("CareerSection", () => {
  it("섹션 제목이 있어야 한다", () => {
    render(<CareerSection />);
    expect(screen.getByRole("heading", { name: /career/i })).toBeInTheDocument();
  });

  it("경력 항목들이 렌더링되어야 한다", () => {
    render(<CareerSection />);
    expect(screen.getByText("슈어소프트테크")).toBeInTheDocument();
    expect(screen.getByText("한국평가데이터")).toBeInTheDocument();
  });
});
```

**Step 2: CareerSection 구현**

```typescript
// components/sections/CareerSection.tsx
import { careerHistory } from "@/data/career";
import Badge from "@/components/ui/Badge";

export default function CareerSection() {
  return (
    <section id="career" className="py-section px-6" aria-labelledby="career-heading">
      <div className="max-w-content mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Experience
          </p>
          <h2 id="career-heading" className="font-display text-4xl md:text-5xl font-bold text-text-primary">
            Career Snapshot
          </h2>
        </div>

        <div className="max-w-2xl space-y-0">
          {careerHistory.map((item, index) => (
            <div key={index} className="relative flex gap-6 pb-8">
              {/* Timeline line */}
              {index < careerHistory.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border-subtle" aria-hidden="true" />
              )}

              {/* Dot */}
              <div className="flex-shrink-0 mt-1">
                <div className={`w-3.5 h-3.5 rounded-full border-2 ${item.current ? "border-accent-primary bg-accent-primary/20" : "border-border-strong bg-bg-surface"}`} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                  <h3 className="font-display font-bold text-text-primary text-lg">
                    {item.company}
                  </h3>
                  <span className="font-mono text-sm text-text-muted">{item.role}</span>
                  {item.current && (
                    <span className="font-mono text-xs text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                      재직 중
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-text-muted mb-3">{item.period}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.keywords.map((keyword) => (
                    <Badge key={keyword}>{keyword}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: 테스트 통과 확인**

Run: `npm run test:run`
Expected: PASS

**Step 4: 커밋**

```bash
git add components/sections/CareerSection.tsx __tests__/
git commit -m "feat: implement Career Snapshot section with vertical timeline"
```

---

## Task 10: About Section

**Files:**
- Create: `components/sections/AboutSection.tsx`
- Create: `__tests__/components/sections/AboutSection.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/components/sections/AboutSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutSection from "@/components/sections/AboutSection";

describe("AboutSection", () => {
  it("About 제목이 있어야 한다", () => {
    render(<AboutSection />);
    expect(screen.getByRole("heading", { name: /about/i })).toBeInTheDocument();
  });

  it("강점 3가지가 있어야 한다", () => {
    render(<AboutSection />);
    const strengths = screen.getAllByRole("listitem");
    expect(strengths.length).toBeGreaterThanOrEqual(3);
  });
});
```

**Step 2: AboutSection 구현**

```typescript
// components/sections/AboutSection.tsx
const strengths = [
  {
    title: "도메인 구조화",
    description:
      "복잡한 도메인 지식을 빠르게 흡수하고, AI가 다룰 수 있는 구조로 정제합니다.",
  },
  {
    title: "시스템 연결",
    description:
      "RAG, Agent, LLMOps를 개별 기술이 아닌 실서비스 문맥에서 통합합니다.",
  },
  {
    title: "제품 & 구현 관점",
    description:
      "엔지니어링 결정이 제품에 어떤 영향을 미치는지 함께 고려하며 설계합니다.",
  },
];

const stats = [
  { value: "3+", label: "Projects" },
  { value: "2", label: "Companies" },
  { value: "1", label: "Publication" },
  { value: "2", label: "Awards" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-section px-6" aria-labelledby="about-heading">
      <div className="max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Text */}
          <div>
            <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
              About
            </p>
            <h2 id="about-heading" className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
              도메인 지식을
              <br />
              AI로 연결합니다.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              실제 현장에서 쓰이는 AI 시스템을 만드는 것을 목표로 합니다.
              단순한 프로토타입이 아니라, 온프레미스 서버에서 동작하는 RAG 챗봇,
              도메인 법령을 탐색하는 GraphRAG, 특화 데이터로 파인튜닝한 sLLM까지.
              문제를 정의하고, 기술을 선택하고, 작동하는 시스템을 납품합니다.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl font-bold text-accent-primary">
                    {stat.value}
                  </div>
                  <div className="font-mono text-xs text-text-muted mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Strengths */}
          <div>
            <h3 className="font-mono text-xs text-text-muted tracking-widest uppercase mb-6">
              Core Strengths
            </h3>
            <ul className="space-y-6">
              {strengths.map((strength, index) => (
                <li key={index} className="flex gap-4">
                  <span className="font-mono text-xs text-accent-primary mt-1 flex-shrink-0">
                    0{index + 1}
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-text-primary mb-1">
                      {strength.title}
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {strength.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: 테스트 통과 확인 & 커밋**

Run: `npm run test:run`
Expected: PASS

```bash
git add components/sections/AboutSection.tsx __tests__/
git commit -m "feat: implement About section with strengths and stats"
```

---

## Task 11: Skills Section

**Files:**
- Create: `components/sections/SkillsSection.tsx`
- Create: `__tests__/components/sections/SkillsSection.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/components/sections/SkillsSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SkillsSection from "@/components/sections/SkillsSection";

describe("SkillsSection", () => {
  it("Skills 제목이 있어야 한다", () => {
    render(<SkillsSection />);
    expect(screen.getByRole("heading", { name: /skills/i })).toBeInTheDocument();
  });

  it("Core Stack 그룹이 있어야 한다", () => {
    render(<SkillsSection />);
    expect(screen.getByText("Core Stack")).toBeInTheDocument();
  });

  it("Python이 Core Stack에 있어야 한다", () => {
    render(<SkillsSection />);
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
});
```

**Step 2: SkillsSection 구현**

```typescript
// components/sections/SkillsSection.tsx
import { skillGroups } from "@/data/skills";

export default function SkillsSection() {
  return (
    <section id="skills" className="py-section px-6" aria-labelledby="skills-heading">
      <div className="max-w-content mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Tech
          </p>
          <h2 id="skills-heading" className="font-display text-4xl md:text-5xl font-bold text-text-primary">
            Skills
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-4 pb-4 border-b border-border-subtle">
                <h3 className="font-display font-bold text-text-primary text-lg">
                  {group.label}
                </h3>
                <p className="font-mono text-xs text-text-muted mt-1">
                  {group.description}
                </p>
              </div>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: 커밋**

```bash
git add components/sections/SkillsSection.tsx __tests__/
git commit -m "feat: implement Skills section with Core/Worked With/Tooling groups"
```

---

## Task 12: Awards, Education & Contact Sections

**Files:**
- Create: `components/sections/AwardsSection.tsx`
- Create: `components/sections/EducationSection.tsx`
- Create: `components/sections/ContactSection.tsx`
- Create: `__tests__/components/sections/ContactSection.test.tsx`

**Step 1: AwardsSection 구현**

```typescript
// components/sections/AwardsSection.tsx
import { awards, publications } from "@/data/awards";
import { Trophy, BookOpen } from "lucide-react";

export default function AwardsSection() {
  return (
    <section id="awards" className="py-section px-6" aria-labelledby="awards-heading">
      <div className="max-w-content mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Recognition
          </p>
          <h2 id="awards-heading" className="font-display text-4xl md:text-5xl font-bold text-text-primary">
            Awards & Publications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Awards */}
          <div>
            <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Trophy size={14} /> Awards
            </h3>
            <div className="space-y-4">
              {awards.map((award, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-card border border-border-subtle bg-bg-surface">
                  <span className="font-mono text-xs text-text-muted flex-shrink-0 mt-0.5">
                    {award.date}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{award.title}</p>
                    {award.organizer && (
                      <p className="font-mono text-xs text-text-muted mt-0.5">{award.organizer}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publications */}
          <div>
            <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <BookOpen size={14} /> Publications
            </h3>
            <div className="space-y-4">
              {publications.map((pub, i) => (
                <div key={i} className="p-4 rounded-card border border-border-subtle bg-bg-surface">
                  <p className="text-sm font-medium text-text-primary mb-2 leading-relaxed">
                    {pub.title}
                  </p>
                  <p className="font-mono text-xs text-text-muted mb-1">{pub.journal}</p>
                  <p className="font-mono text-xs text-text-muted mb-2">{pub.year}</p>
                  {pub.doi && (
                    <a
                      href={pub.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-accent-primary hover:underline"
                    >
                      DOI →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: EducationSection 구현**

```typescript
// components/sections/EducationSection.tsx
import { education, certifications } from "@/data/education";

export default function EducationSection() {
  return (
    <section className="py-12 px-6" aria-labelledby="education-heading">
      <div className="max-w-content mx-auto">
        <h2 id="education-heading" className="font-display text-3xl font-bold text-text-primary mb-8">
          Education & Certifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Education */}
          <div>
            {education.map((edu, i) => (
              <div key={i} className="p-4 rounded-card border border-border-subtle bg-bg-surface">
                <p className="font-display font-bold text-text-primary">{edu.institution}</p>
                <p className="text-sm text-text-secondary mt-1">{edu.degree}</p>
                {edu.gpa && (
                  <p className="font-mono text-xs text-accent-primary mt-1">GPA {edu.gpa}</p>
                )}
                <p className="font-mono text-xs text-text-muted mt-1">{edu.period}</p>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-card border border-border-subtle bg-bg-surface">
                <p className="text-sm text-text-primary">{cert.name}</p>
                <span className="font-mono text-xs text-text-muted flex-shrink-0 ml-4">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: ContactSection 테스트 작성**

```typescript
// __tests__/components/sections/ContactSection.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactSection from "@/components/sections/ContactSection";

describe("ContactSection", () => {
  it("Contact 섹션 제목이 있어야 한다", () => {
    render(<ContactSection />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("이메일 링크가 있어야 한다", () => {
    render(<ContactSection />);
    const emailLink = screen.getByRole("link", { name: /email/i });
    expect(emailLink).toHaveAttribute("href", expect.stringContaining("mailto:"));
  });

  it("GitHub 링크가 있어야 한다", () => {
    render(<ContactSection />);
    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink).toBeInTheDocument();
  });
});
```

**Step 4: ContactSection 구현**

```typescript
// components/sections/ContactSection.tsx
import { Github, Mail, MessageCircle } from "lucide-react";

const contactLinks = [
  {
    label: "Email",
    href: "mailto:your-email@example.com",
    icon: Mail,
    value: "your-email@example.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/yourusername",
    icon: Github,
    value: "github.com/yourusername",
  },
  {
    label: "Threads",
    href: "https://threads.net/@yourhandle",
    icon: MessageCircle,
    value: "@yourhandle",
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-section px-6" aria-labelledby="contact-heading">
      <div className="max-w-content mx-auto">
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Contact
          </p>
          <h2 id="contact-heading" className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
            함께 만들고 싶은
            <br />
            AI 시스템이 있다면
          </h2>
          <p className="text-text-secondary mb-10">
            협업 제안이나 문의는 아래로 연락 주세요.
          </p>

          <div className="space-y-3">
            {contactLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="flex items-center gap-4 p-4 rounded-card border border-border-subtle bg-bg-surface hover:border-border-strong hover:bg-bg-hover transition-all duration-200 group"
                  aria-label={link.label}
                >
                  <Icon size={18} className="text-text-muted group-hover:text-accent-primary transition-colors" />
                  <span className="font-mono text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {link.value}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 5: 커밋**

```bash
git add components/sections/ __tests__/
git commit -m "feat: implement Awards, Education, and Contact sections"
```

---

## Task 13: 메인 페이지 조합 (app/page.tsx)

**Files:**
- Modify: `app/page.tsx`

**Step 1: 모든 섹션을 page.tsx에 조합**

```typescript
// app/page.tsx
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import CareerSection from "@/components/sections/CareerSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import AwardsSection from "@/components/sections/AwardsSection";
import EducationSection from "@/components/sections/EducationSection";
import ContactSection from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProjectsSection />
      <CareerSection />
      <AboutSection />
      <SkillsSection />
      <AwardsSection />
      <EducationSection />
      <ContactSection />
    </>
  );
}
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 에러 없음, 모든 페이지 정적 생성

**Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "feat: compose main page with all sections"
```

---

## Task 14: Project Detail Page

**Files:**
- Create: `app/projects/[slug]/page.tsx`

**Step 1: 정적 경로 생성 + 상세 페이지 구현**

```typescript
// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/data/projects";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SSG: 모든 프로젝트 slug 정적 생성
export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} | Jin YoungIn`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div className="pt-24 pb-section px-6">
      <div className="max-w-article mx-auto">
        {/* Back */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-sm text-text-muted hover:text-text-primary transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {/* Header */}
        <header className="mb-12">
          <p className="font-mono text-xs text-text-muted mb-2">{project.company}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {project.title}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-card border border-border-subtle bg-bg-surface mb-6">
            {[
              { label: "기간", value: project.period },
              { label: "팀 규모", value: project.teamSize },
              { label: "소속", value: project.company },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-mono text-xs text-text-muted mb-1">{label}</p>
                <p className="text-sm text-text-primary font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </header>

        {/* Key Achievement */}
        <div className="p-4 rounded-card border border-success/20 bg-success/5 mb-12">
          <p className="font-mono text-xs text-success mb-1">Key Achievement</p>
          <p className="text-text-primary">{project.keyAchievement}</p>
        </div>

        {/* Detail Content (if available) */}
        {project.detail ? (
          <article className="space-y-12">
            {[
              { title: "Problem", content: project.detail.problem },
              { title: "My Role", content: project.detail.role },
              { title: "Architecture", content: project.detail.architecture },
              { title: "Implementation", content: project.detail.implementation },
              { title: "Impact", content: project.detail.impact },
              { title: "Learnings", content: project.detail.learnings },
            ].map(({ title, content }) => (
              <section key={title}>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-4">{title}</h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">{content}</p>
              </section>
            ))}
          </article>
        ) : (
          <div className="text-center py-16 text-text-muted">
            <p>상세 내용을 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected:
- 모든 project slug 정적 생성 완료
- `<main>` 랜드마크는 `app/layout.tsx`에만 1회 존재(상세 페이지 내부에는 중복 생성하지 않음)

**Step 3: 커밋**

```bash
git add app/projects/
git commit -m "feat: implement Project Detail page with SSG and case study layout"
```

---

## Task 15: Framer Motion 애니메이션 (절제된 버전)

**Files:**
- Create: `components/ui/FadeIn.tsx`
- Modify: `components/sections/HeroSection.tsx`
- Create: `lib/motion.ts`
- Create: `__tests__/components/ui/FadeIn.test.tsx`

**Step 1: motion 설정 파일**

```typescript
// lib/motion.ts
// prefers-reduced-motion을 존중하는 기본 애니메이션 설정
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

**Step 2: FadeIn 래퍼 컴포넌트**

```typescript
// components/ui/FadeIn.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Step 3: HeroSection에 초기 진입 애니메이션 추가**

HeroSection의 주요 텍스트를 `motion.div`로 감싸고 stagger 효과 추가.
각 요소에 `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` 적용.
`prefers-reduced-motion` 체크 적용.

**Step 4: 각 Section에 FadeIn 적용**

ProjectsSection, CareerSection 등 주요 섹션의 카드/항목들을 FadeIn으로 감싸기.

**Step 5: FadeIn 테스트 추가**

```typescript
// __tests__/components/ui/FadeIn.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FadeIn from "@/components/ui/FadeIn";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion" {...props}>{children}</div>,
  },
  useReducedMotion: () => true,
}));

describe("FadeIn", () => {
  it("reduced motion 환경에서도 콘텐츠를 그대로 렌더링한다", () => {
    render(
      <FadeIn className="wrapper">
        <span>content</span>
      </FadeIn>
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
```

**Step 6: 테스트 + 빌드 확인**

Run: `npm run test:run`
Expected: 새 FadeIn 테스트 포함 전체 PASS

Run: `npm run build`
Expected: 에러 없음

**Step 7: 커밋**

```bash
git add components/ui/FadeIn.tsx lib/motion.ts components/sections/ __tests__/components/ui/FadeIn.test.tsx
git commit -m "feat: add subtle Framer Motion animations with reduced-motion support"
```

---

## Task 16: SEO & 메타데이터

**Files:**
- Modify: `app/layout.tsx` (OG 이미지, robots)
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `public/og-image.png` (1200x630 권장)

**Step 1: app/layout.tsx 메타데이터 강화**

```typescript
// app/layout.tsx (metadata 부분)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://youngin-jin.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Jin YoungIn | AI Engineer Portfolio",
  description:
    "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Jin YoungIn Portfolio",
    title: "Jin YoungIn | AI Engineer Portfolio",
    description:
      "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jin YoungIn Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jin YoungIn | AI Engineer Portfolio",
    description:
      "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Step 2: sitemap.ts (도메인 하드코딩 제거)**

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://youngin-jin.vercel.app";

  const projectUrls = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projectUrls,
  ];
}
```

**Step 3: robots.ts (도메인 하드코딩 제거)**

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://youngin-jin.vercel.app";

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

**Step 4: 빌드 & 커밋**

Run: `NEXT_PUBLIC_SITE_URL=https://youngin-jin.vercel.app npm run build`
Expected: `/sitemap.xml`, `/robots.txt` 정적 생성 + metadata 경고 없음

```bash
git add app/layout.tsx app/sitemap.ts app/robots.ts public/og-image.png
git commit -m "feat: enhance metadata and add sitemap/robots with env-based site URL"
```

---

## Task 17: 실제 연락처 정보 업데이트

**Files:**
- Modify: `components/sections/ContactSection.tsx`
- Modify: `data/projects.ts` (플레이스홀더 내용 채우기)

**Step 1: ContactSection의 이메일/GitHub/Threads 실제 값으로 교체**

`contactLinks` 배열에서 플레이스홀더 값(`your-email@example.com`, `yourusername`, `@yourhandle`)을 실제 정보로 변경.

**Step 2: data/projects.ts 플레이스홀더 정리**

- `https://doi.org/...` 같은 임시 DOI 제거 또는 실제 DOI로 교체
- `"프로젝트 설명을 추가해주세요."`, `"주요 성과를 추가해주세요."` 같은 임시 문구 제거
- 공개해도 되는 범위의 실제 프로젝트 데이터만 유지

**Step 3: 리그레션 확인**

Run: `npm run test:run`
Expected: PASS

Run: `npm run build`
Expected: PASS

**Step 4: 커밋**

```bash
git add components/sections/ContactSection.tsx data/projects.ts
git commit -m "feat: replace placeholder contact/project data with production-ready content"
```

---

## Task 18: 반응형 & 접근성 최종 검토

**Files:** 필요에 따라 여러 컴포넌트 수정

**Step 1: 모바일 브레이크포인트 확인**

- Hero: 모바일에서 텍스트 크기 적절한지 확인
- Projects grid: 1 → 2 → 3 컬럼 전환 확인
- Career timeline: 모바일 레이아웃 확인
- Header 모바일 메뉴 동작 확인

**Step 2: 접근성 체크리스트**

- [ ] `<main>` 랜드마크가 `app/layout.tsx` 기준으로 1개만 존재
- [ ] 모든 섹션에 `aria-labelledby` 연결
- [ ] 링크/버튼 aria-label 적절
- [ ] 색상 대비 충분 (text-text-primary: #F1F5F9 on #0A0A0F = 17.9:1 ✓)
- [ ] focus-visible 스타일 적용됨

**Step 3: 콘텐츠 릴리즈 게이트**

- [ ] `public/resume.pdf` 파일 실제 존재 및 다운로드 동작 확인
- [ ] `your-email@example.com`, `yourusername`, `@yourhandle`, `https://doi.org/...` 플레이스홀더가 코드에서 제거됨
- [ ] 외부 링크에 `target="_blank"` 사용 시 `rel="noopener noreferrer"` 적용됨

**Step 4: 최종 빌드 확인**

Run: `npm run build`
Expected: 에러 없음

**Step 5: 커밋**

```bash
git add -A
git commit -m "fix: responsive and accessibility improvements"
```

---

## Verification (최종 검증)

```bash
# 1. 전체 테스트 실행
npm run test:run

# 2. 프로덕션 빌드
NEXT_PUBLIC_SITE_URL=https://youngin-jin.vercel.app npm run build

# 3. 플레이스홀더/임시값 최종 점검
rg -n "your-email@example.com|yourusername|@yourhandle|https://doi.org/\\.\\.\\.|프로젝트 설명을 추가해주세요|주요 성과를 추가해주세요" app components data

# 4. 로컬 프로덕션 서버 실행
npm run start

# 5. 확인 항목:
# - http://localhost:3000 — 메인 페이지
# - http://localhost:3000/projects/graphrag-maritime-law — Featured 프로젝트 상세
# - http://localhost:3000/sitemap.xml — 사이트맵 생성 확인

# 6. Lighthouse 점수 목표: 90+
```

---

## 파일 구조 요약

```
/Users/0in11/Desktop/folio_web/
├── app/
│   ├── layout.tsx              # 폰트 + 전역 메타데이터
│   ├── page.tsx                # 메인 페이지 (섹션 조합)
│   ├── globals.css             # Tailwind + 기본 스타일
│   ├── sitemap.ts
│   ├── robots.ts
│   └── projects/
│       └── [slug]/
│           └── page.tsx        # 프로젝트 상세 (SSG)
├── public/
│   └── og-image.png            # Open Graph 이미지
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # 스크롤 반투명, 고정
│   │   └── MobileMenu.tsx      # 전체화면 오버레이
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── CareerSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── AwardsSection.tsx
│   │   ├── EducationSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── ProjectCard.tsx
│       └── FadeIn.tsx
├── data/
│   ├── projects.ts             # 9개 (Featured 3 + More Projects)
│   ├── career.ts
│   ├── skills.ts
│   ├── education.ts
│   ├── awards.ts
│   └── index.ts
├── lib/
│   ├── utils.ts                # cn()
│   └── motion.ts               # Framer Motion 프리셋
├── __tests__/
│   ├── data/projects.test.ts
│   ├── lib/utils.test.ts
│   ├── components/ui/FadeIn.test.tsx
│   └── components/...
├── tailwind.config.ts
└── vitest.config.ts
```

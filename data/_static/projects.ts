import type { Project } from "@/data/projects";

export interface StaticProject extends Omit<Project, "markdownContent"> {
  markdownPath?: string;
  imageMap?: Record<string, string>;
}

export const projects: StaticProject[] = [
  // ─── Featured Projects ───────────────────────────────────────────
  {
    id: "graphrag-maritime",
    slug: "graphrag-maritime-law",
    title: "해양 법령 GraphRAG 시스템",
    company: "슈어소프트테크(Suresoft)",
    description:
      "6종 해양 법령을 호(Item) 단위까지 파싱하여 Knowledge Graph로 구축하고, LangGraph 기반 다단계 GraphRAG 검색 파이프라인을 개발했습니다.",
    period: "2025.09 – 2025.10",
    teamSize: "1인 (단독 개발)",
    technologies: [
      "LangGraph",
      "Neo4j",
      "GPT-4o",
      "RAGAS",
      "PyMuPDF",
      "ko-reranker",
    ],
    keyAchievement:
      "Community Search + Vector Search + Graph Expansion 결합으로 Retrieval 3개 메트릭(Precision 0.94 / Recall 0.88 / Faithfulness 0.93) 달성",
    featured: true,
    markdownPath: "projects/graph_rag/graph_rag.md",
    imageMap: {
      "graph_schmea.png": "/projects/graphrag-maritime-law/graph-schema.png",
    },
  },
  {
    id: "on-premise-chatbot",
    slug: "on-premise-chatbot",
    title: "On-Premise RAG 챗봇",
    company: "한국평가데이터(KoDATA)",
    description:
      "온프레미스 환경에서 사내 법령·규정 기반 RAG 챗봇을 설계부터 배포까지 1인 풀스택으로 구현한 프로젝트입니다.",
    period: "2025.04 – 2025.09",
    teamSize: "1인 (기획~배포 전 과정)",
    technologies: [
      "EXAONE-3.5-32B",
      "LangGraph",
      "ChromaDB",
      "FastAPI",
      "Svelte",
      "Redis",
      "Docling",
      "Docker Compose",
    ],
    keyAchievement:
      "외부 API 없이 온프레미스 워크스테이션만으로 동작하는 법령·규정 전용 RAG 챗봇 구축 및 배포",
    featured: true,
    markdownPath: "projects/onpremise_chatbot/on-premise-chatbot.md",
    imageMap: {
      "attachment:0a9d3259-3d09-4225-a3c0-53598955c16c:image.png":
        "/projects/on-premise-chatbot/architecture.png",
      "attachment:6027bf81-2a4a-4e7a-afcd-6bd47810b2ec:스크린샷_2025-10-11_오후_1.42.39.png":
        "/projects/on-premise-chatbot/chatbot-main.png",
    },
  },
  {
    id: "domain-sllm",
    slug: "domain-specific-sllm",
    title: "도메인 특화 sLLM 개발",
    company: "슈어소프트테크(Suresoft)",
    description:
      "도메인 특화 sLLM을 위한 데이터셋 구축부터 CPT 학습까지, LLMOps 파이프라인 전반을 설계·수행한 프로젝트입니다.",
    period: "2025.09 – 진행 중",
    teamSize: "2인 (개발 1인 + PM 1인)",
    technologies: [
      "vLLM",
      "llama.cpp",
      "LLaMA-Factory",
      "PaddleOCR",
      "DeepSeek-OCR",
      "NVIDIA L40S",
    ],
    keyAchievement:
      "약 120만 토큰 규모 해양 도메인 데이터셋 구축 및 CPT 학습 전략 설계",
    featured: true,
    markdownPath: "projects/domain_llm/domain_llm.md",
  },

  // ─── More Projects ──────────────────────────────────────────────
  {
    id: "text2vr",
    slug: "text2vr",
    title: "Text2VR",
    company: "상명대학교 졸업 프로젝트",
    description:
      "단일 텍스트 프롬프트로부터 상호작용형 VR 장면을 생성하는 End-to-End 모듈형 파이프라인",
    period: "2025.01 – 2025.11",
    teamSize: "4인 (팀 기라사니)",
    technologies: [
      "LangGraph",
      "StitchDiffusion",
      "Grounding SAM",
      "Trellis",
      "Unity",
      "React",
      "Docker Compose",
      "GCP",
    ],
    keyAchievement: "KCI 논문 게재 및 졸업 발표회 우수상 수상",
    featured: false,
    markdownPath: "projects/text2vr/text2vr.md",
    imageMap: {
      "attachment:2aa95c56-e6db-4de5-b044-a6c7d9db1f2d:image.png":
        "/projects/text2vr/overview.png",
      "attachment:f904759c-4a13-4c72-b327-dad0fdf7d088:image.png":
        "/projects/text2vr/architecture.png",
      "attachment:c74c03dd-555e-4df2-b20b-8aff6d199ffd:image.png":
        "/projects/text2vr/vr-scene.png",
    },
  },
];

export function getFeaturedProjects(): StaticProject[] {
  return projects.filter((p) => p.featured);
}

export function getMoreProjects(): StaticProject[] {
  return projects.filter((p) => !p.featured);
}

export function getProjectBySlug(slug: string): StaticProject | undefined {
  return projects.find((p) => p.slug === slug);
}

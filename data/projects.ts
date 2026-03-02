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
      impact: "복잡한 법령 조회 소요 시간 단축. 관련 법령 누락률 감소.",
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
      impact: "문서 검색 소요 시간 대폭 단축. 직원 정보 접근성 향상.",
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

  // ─── More Projects ──────────────────────────────────────────────
  {
    id: "text2vr",
    slug: "text2vr",
    title: "Text2VR",
    company: "상명대학교 연구",
    description:
      "단일 텍스트 프롬프트에서 VR 장면을 생성하는 모듈형 파이프라인 연구 프로젝트.",
    period: "2024.03 – 2025.02",
    teamSize: "3인",
    technologies: ["Python", "Stable Diffusion", "Three.js"],
    keyAchievement: "KCI 등재 논문으로 발표",
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

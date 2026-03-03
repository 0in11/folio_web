export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface DetailSection {
  title: string;
  content?: string;
  image?: ProjectImage;
  table?: { label: string; value: string }[];
  tableHeaders?: [string, string];
  subsections?: { title: string; content: string }[];
}

export interface ProjectDetail {
  problem?: string;
  role?: string;
  architecture?: string;
  implementation?: string;
  impact?: string;
  learnings?: string;
  architectureImage?: ProjectImage;
  demoImages?: ProjectImage[];
  sections?: DetailSection[];
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
    detail: {
      sections: [
        {
          title: "문제 정의",
          content:
            "한국평가데이터에서는 향후 RAG 기반 서비스의 확장 가능성을 검증하기 위해, 사내 법령과 규정을 대상으로 한 챗봇 프로토타입이 필요한 상황\n\n**핵심 과제:**\n\n- 사내 보안 정책상 외부 API(ChatGPT 등) 사용이 불가하여, 온프레미스 환경에서 자체적으로 LLM을 서빙해야 하는 제약이 있었음\n- 법령과 사내 규정이라는 두 가지 성격이 다른 문서 소스를 하나의 시스템에서 효과적으로 다뤄야 했음\n- RAG 파이프라인의 확장성을 고려한 구조 설계가 요구됨\n\n→ **외부 의존 없이, 온프레미스 워크스테이션만으로 동작하는 법령·규정 전용 RAG 챗봇 구축**이 목표",
        },
        {
          title: "기술 스택",
          table: [
            { label: "LLM", value: "EXAONE-3.5-32B (4bit 양자화)" },
            { label: "Embedding", value: "bge-m3-ko" },
            { label: "RAG Framework", value: "LangGraph" },
            { label: "Vector DB", value: "ChromaDB" },
            { label: "Backend", value: "FastAPI" },
            { label: "Frontend", value: "Svelte" },
            { label: "캐싱", value: "Redis" },
            { label: "문서 파싱", value: "Docling" },
            { label: "배포", value: "Docker Compose" },
          ],
          tableHeaders: ["분류", "기술"],
        },
        {
          title: "시스템 아키텍처",
          image: {
            src: "/projects/on-premise-chatbot/architecture.png",
            alt: "RAG 챗봇 시스템 아키텍처",
          },
          content:
            "- **GENERAL 모드**: 검색 없이 LLM에 바로 질문을 전달하여 응답 생성\n- **LAW / POLICY 모드**: 법령 또는 사내 규정 전용 ChromaDB Collection에서 관련 문서를 검색한 뒤, 검색 결과를 컨텍스트로 포함하여 응답 생성\n- 법령과 규정을 **별도 Collection으로 분리 저장**하여, 모드별로 타겟 검색함으로써 노이즈 최소화\n- 사용자가 업로드한 문서는 Docling을 통해 파싱 후 임베딩하여 저장 가능",
        },
        {
          title: "핵심 구현 & 의사결정",
          subsections: [
            {
              title: "Challenge 1: 온프레미스 환경에서의 LLM 서빙",
              content:
                "외부 API를 사용할 수 없는 환경이었기 때문에, 워크스테이션 GPU만으로 32B 파라미터 모델을 서빙해야 하는 상황\n\n- **시도**: EXAONE-3.5-32B를 4bit 양자화하여 단일 GPU에서 구동 가능하도록 경량화\n- **결과**: VRAM 제약 내에서 안정적으로 서빙 가능했고, GENERAL 모드 기준 실시간에 가까운 응답 속도를 확보",
            },
            {
              title: "Challenge 2: Reranker 없이 검색 품질 확보",
              content:
                "사내 보안 환경의 제약으로 외부 Reranker 모델 사용이 어려운 상황\n\n- **시도**: Dense Retrieval(bge-m3-ko)과 Sparse Retrieval(BM25)을 결합하는 RRF(Reciprocal Rank Fusion) 하이브리드 전략을 적용\n- **결과**: 단일 Dense Retrieval 대비 검색 관련성이 개선되었으나, Reranker 없이는 정밀도에 한계가 존재\n- **트레이드오프**: 추가적인 검색 정교화보다는, 주어진 환경 내에서 빠르게 동작하는 안정적인 파이프라인 구축에 집중",
            },
            {
              title: "Challenge 3: 첫 풀스택 개발 & Docker 배포",
              content:
                "백엔드(FastAPI)부터 프론트엔드, 그리고 Docker Compose를 통한 멀티 컨테이너 배포까지 전 과정을 1인으로 처음 수행한 프로젝트\n\n- **시도**: FastAPI 서버, 프론트앤드 등을 각각 컨테이너로 분리하고 Docker Compose로 통합 관리\n- **난관**: 컨테이너 간 네트워크 설정, 볼륨 마운트 등 인프라 레벨의 이슈를 하나씩 해결해야 했음\n- **결과**: 최종적으로 `docker compose up` 한 번으로 전체 서비스가 구동되는 배포 환경을 구성하여, 워크스테이션에 안정적으로 배포 완료",
            },
          ],
        },
        {
          title: "구현 결과물",
          content: "챗봇 메인 화면 — GENERAL / LAW / POLICY 모드 선택 UI",
          image: {
            src: "/projects/on-premise-chatbot/chatbot-main.png",
            alt: "챗봇 메인 화면 — GENERAL / LAW / POLICY 모드 선택 UI",
            caption: "챗봇 메인 화면(React ver.)",
          },
        },
        {
          title: "성과 & 임팩트",
          table: [
            { label: "평균 동시 접속자", value: "약 15명" },
            { label: "GENERAL 모드 응답 시간", value: "실시간 수준" },
            {
              label: "LAW/POLICY 모드 응답 시간",
              value: "약 30~40초 (RAG 파이프라인 포함)",
            },
            { label: "운영 기간", value: "인턴 기간 중 안정적 운영" },
          ],
          tableHeaders: ["지표", "수치"],
          content:
            "- 외부 API 없이 온프레미스 환경에서 자체적으로 LLM 기반 서비스를 구축·배포할 수 있음을 검증\n- 풀스택(프론트엔드 - 백엔드 - 인프라)을 1인으로 완결한 End-to-End 프로젝트",
        },
        {
          title: "회고 & 학습",
          subsections: [
            {
              title: "잘한 점",
              content:
                "- 기획부터 배포까지 전 과정을 1인으로 완수한 것 자체가 큰 경험이었음\n- Docker Compose를 활용한 컨테이너화 배포 구조를 설계하여, 재배포와 환경 이전이 용이하도록 구성",
            },
            {
              title: "아쉬운 점",
              content:
                "- RAG 파이프라인이 단순한 Dense+Sparse 하이브리드(RRF)에 그쳤음\n- Reranker를 사용할 수 없는 환경적 제약이 있었지만, Query Decomposition 등 다른 검색 보강 기법을 시도해보지 못한 것이 아쉬움",
            },
            {
              title: "다시 한다면",
              content:
                "- 프로젝트 초기부터 검색 품질 평가를 위한 Golden Set을 구축하여, 파이프라인 변경 시 정량적으로 비교할 수 있는 체계를 갖출 것\n- Multi-hop Retrieval 등 보다 다양한 RAG 방법론을 적용하여 검색 정확도를 끌어올릴 것",
            },
          ],
        },
      ],
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

> 6종 해양 법령의 Knowledge Graph 구축 및 다단계 GraphRAG 검색 파이프라인
> 

---

## 📋 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| **소속** | Suresoft — 해양특화 sLLM 프로젝트의 하위 서비스 |
| **한 줄 요약** | 6종 해양 법령을 호(Item) 단위까지 파싱하여 Knowledge Graph로 구축하고, LangGraph 기반 다단계 GraphRAG 검색 파이프라인 개발 |
| **기간** | 2025.09 ~ 2025.10 (약 2개월) |
| **인원** | 1명 (단독 개발) |
| **대상 법령** | 해운법, 항만법, 해상교통안전법 시행령, 특수화물 선박운송 규칙, 어선안전조업법 시행령, 국제항해선박 보안법 시행규칙 |

---

## ❓ 문제 정의

해양 법령은 조항 간 교차참조가 빈번하고(예: "해운법 제17조에 따른..." → 항만법 참조), 법 → 장 → 조 → 항 → 호의 깊은 계층 구조를 가짐. 단순 Vector RAG로는 이러한 **관계 정보를 활용할 수 없어** 검색 품질에 한계가 존재하는 상황

**핵심 과제:**

- 6종 해양 법령 PDF를 호(Item) 단위까지 파싱하여 Knowledge Graph로 구조화해야 함
- 법령 간 교차참조(`REFERS_TO`), 의미적 유사성, 구조적 인접성을 모두 활용하는 검색 파이프라인 구축 필요
- RAGAS 프레임워크를 통한 정량적 성능 검증 필요

→ **법령의 계층 구조와 상호 참조 관계를 Graph로 표현하고, Community Detection + Vector Search + Graph Expansion을 결합한 다단계 GraphRAG 파이프라인 구축**이 목표

---

## 🔧 기술 스택

| 분류 | 기술 |
| --- | --- |
| **파이프라인 오케스트레이션** | LangGraph + LangChain |
| **Knowledge Graph DB** | Neo4j (GDS 라이브러리 포함) |
| **LLM** | GPT-4o (개발), FriendliAI SK A.X 4.0 (On-premise 대응) |
| **Embedding** | text-embedding-3-small (On-premise: bge-m3-ko 교체 대응) |
| **Reranker** | upskyy/ko-reranker |
| **법령 파싱** | PyMuPDF, pdfminer.six, regex, tiktoken |
| **평가** | RAGAS Framework |

---

## 💡 핵심 구현 & 의사결정

### Challenge 1: 법령 파싱 및 Knowledge Graph 스키마 설계

6종 해양 법령 PDF를 구조화된 그래프로 변환해야 하는 상황. 법령 특성상 교차참조가 빈번하여 **Graph 구조가 필수적**이라고 판단

![                                                                   Knowledge Graph Node&Edge 구조](graph_schmea.png)

                                                                   Knowledge Graph Node&Edge 구조

**노드 스키마 설계:**

- `Law` → `Chapter` → `Article` → `Paragraph` → `Item` 의 5단계 계층 구조
- `Version` 노드: 실제 조문 텍스트, 시행일, 임베딩을 담는 콘텐츠 노드. Paragraph/Item은 영구적 앵커 역할만 수행하고, 실제 텍스트는 Version으로 분리하여 **개정 이력 관리에 대응**
- `Term` 노드: 해양 전문 용어 매핑

**엣지 스키마:**

- 구조 관계: `HAS_CHAPTER`, `HAS_ARTICLE`, `HAS_PARAGRAPH`, `HAS_ITEM`, `HAS_VERSION`
- 의미 관계: `REFERS_TO` (타 법령 교차참조), `MENTIONS_TERM` (용어 참조)
- 교차참조 추출: 정규표현식으로 본문 내 타 법령 인용 패턴을 파싱하여 `REFERS_TO` 엣지로 자동 연결

**파싱 구현:**

- PDF에서 텍스트 추출(PyMuPDF 우선, 실패 시 pdfminer.six fallback) → 헤더/푸터 제거 → 장/조 구조 파싱 → 항(①②...)/호(1. 2. ...) 계층 파싱
- 인라인 개정/신설/삭제 태그를 제거하되 내부 날짜는 `rev_events` 메타데이터로 보존
- 노드/엣지를 JSONL로 출력하여 Neo4j에 일괄 인덱싱

### Challenge 2: Community Detection 및 요약 생성

Graph 내 의미적으로 연관된 조항들을 그룹화하여 검색 효율을 높여야 하는 상황

**RELATED_TO 엣지 구성:**

- 의미 기반 (가중치 0.7): Paragraph/Item의 임베딩으로 kNN 수행, 동적 임계값 이상인 쌍에 `semantic_score` 부여
- 구조 기반 (가중치 0.3): Paragraph/Item의 인접 관계 및 교차 연결에 `structured_score` 부여
- 최종 `score = semantic × 0.7 + structure × 0.3` 으로 합산

**Leiden 클러스터링:**

- Neo4j GDS의 Leiden 알고리즘으로 Community 노드 자동 생성
- 각 Community의 주요 조항 텍스트를 추려 **LLM으로 요약 생성** → 커뮤니티 임베딩으로 저장
- 이 커뮤니티 요약 임베딩이 이후 검색 파이프라인의 1차 필터 역할 수행

### Challenge 3: 다단계 GraphRAG 검색 파이프라인

LangGraph로 4단계 파이프라인을 구성하여, 단순 벡터 검색을 넘어 그래프 관계까지 활용하는 검색 체계를 구축

**Stage 1 — Query Analysis**

- 사용자 쿼리를 분석하여 `law_focus`(관련 법률 주제)와 `rewritten_query`(법률 검색 최적화 쿼리)로 재작성

**Stage 2 — Retrieve Docs (핵심 검색 로직)**

- **Community Search**: 쿼리 임베딩 ↔ 커뮤니티 요약 임베딩의 코사인 유사도로 상위 K개 커뮤니티 선택 → 커뮤니티 내부 Version 임베딩 대상 벡터 검색
- **Vector Index Search**: 커뮤니티에 무관하게 전체 벡터 인덱스에서 검색 (커뮤니티 기반 검색의 누락 보완)
- **Deduplicate → Reranking**: 중복 제거 후 Reranker로 상위 top_k 문서 선정
- **Structural Neighbors**: 선정된 문서와 같은 조문 내 다른 항/호를 코사인 유사도 기반으로 보조 근거 확보 (맥락 유지)
- **Graph Expansion**: `RELATED_TO` 엣지로 연관 조문 탐색 + `REFERS_TO` 엣지로 명시적 인용 조문 추적
- **Relevance Check**: LLM으로 최종 문서 후보의 관련성 판정 (confidence score 포함)

**Stage 3 — Reasoning**

- 검색된 문서를 기반으로 근거 정렬 → 해석 → 리스크 식별 → 최종 권고까지 구조화된 법률 논증 생성

**Stage 4 — Answer Generation**

- 추론 결과를 사용자 친화적인 최종 응답으로 변환

### Challenge 4: RAGAS 기반 평가 체계 구축

파이프라인의 검색 품질과 응답 품질을 정량적으로 검증해야 하는 상황

**평가 데이터셋:**

- Gemini 2.5 Pro에 6종 법령 PDF 전체를 첨부하여 법령별 6개 QA 생성 (총 36개)
- 각 QA는 `Question`, `Answer`, `Reference Contexts` 형태

**평가 프로세스:**

- QA 데이터셋의 질문으로 LangGraph 파이프라인 실행 → 검색 문서 + LLM 응답 기록
- RAGAS의 4가지 메트릭으로 성능 측정

---

## 🙋‍♂️ 담당 역할

- **법령 파싱 파이프라인 개발**: 6종 해양 법령 PDF → 호(Item) 단위 파싱, JSONL 출력
- **Knowledge Graph 설계 및 구축**: 노드/엣지 스키마 설계, Neo4j 인덱싱, 교차참조 자동 연결
- **Community Detection**: RELATED_TO 엣지 생성, Leiden 클러스터링, LLM 요약 생성
- **GraphRAG 검색 파이프라인**: LangGraph 기반 4단계 파이프라인 전체 구현
- **평가 체계 구축**: RAGAS 기반 평가 데이터셋 생성 및 성능 검증

---

## 📈 성과 & 임팩트

**RAGAS 평가 결과 (최종):**

| 메트릭 | 평균 | 의미 |
| --- | --- | --- |
| **Context Precision** | 0.94 | 검색기가 질문에 필요한 핵심 정보만 정확히 가져옴 |
| **Context Recall** | 0.88 | 답변에 필요한 모든 근거 정보를 빠짐없이 검색 |
| **Faithfulness** | 0.93 | LLM이 근거 문서에 기반하여 정직하게 응답 생성 |
| **Answer Relevancy** | 0.39 | 프롬프트의 부연설명 유도로 인한 낮은 점수 (의도적 trade-off) |
- 6종 해양 법령을 호(Item) 단위까지 파싱하여 Neo4j Knowledge Graph에 인덱싱 완료
- Community Search + Vector Search + Graph Expansion을 결합한 다단계 검색으로, 단순 Vector RAG 대비 교차참조 기반 맥락 검색 가능
- Retrieval 3개 메트릭(Precision 0.94 / Recall 0.88 / Faithfulness 0.93) 모두 높은 수준 달성

---

## 💭 회고 & 학습

### 잘한 점

- 법령의 교차참조 특성을 파악하여 Vector RAG가 아닌 GraphRAG를 선택한 판단. `REFERS_TO` 엣지를 통해 명시적 인용 관계를 검색에 직접 활용할 수 있게 된 점
- Version 노드를 앵커(Paragraph/Item)와 분리한 스키마 설계로, 향후 법령 개정 시 Version만 추가하면 되는 확장 가능한 구조를 만든 점
- Community 요약 → 내부 벡터 검색 → Graph Expansion의 다단계 구조로, 검색 범위를 점진적으로 넓히면서도 정밀도를 유지한 점

### 아쉬운 점

- 평가 데이터셋이 36개(법령당 6개)로 규모가 작아, 통계적 유의성 확보에 한계가 있었던 점
- Answer Relevancy가 0.39로 낮게 나왔는데, 이는 사용자 친화적 부연설명을 유도하는 프롬프트의 의도적 결과이지만, 간결한 응답과 풍부한 응답 사이의 균형점을 더 탐색했어야 한 점
- 별표(테이블) 파싱이 해운법만 적용되고, 나머지 4개 법령의 스캔본/복잡 테이블은 미처리 상태로 남은 점
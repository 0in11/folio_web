> 도메인 특화 sLLM을 위한 데이터셋 구축부터 CPT 학습까지, LLMOps 파이프라인 전반을 설계·수행한 프로젝트
> 

---

## 📋 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| **소속** | 슈어소프트테크 |
| **한 줄 요약** | 도메인 특화 sLLM 개발을 위한 
데이터셋 구축 및 학습 파이프라인 설계 |
| **기간** | 2025.09 ~  |
| **인원** | 2인 (개발 1인(본인) + PM 1인) |

---

## ❓ 문제 정의

클라이언트의 Agent 시스템에서, LLM이 두 가지 핵심 역할을 수행해야 하는 상황:

- **Supervisor Agent의 Orchestrator**: 여러 하위 Agent를 조율하고 Function Calling을 통해 적절한 도구를 호출해야 함
- **최종 응답 생성기**: RAG 컨텍스트를 받아 해양 도메인 전문 질의에 대해 정확한 응답을 생성해야 함

범용 LLM은 도메인 전문 용어와 규정에 대한 이해가 부족하여, Orchestration 정확도와 응답 품질 모두에서 한계가 있었음

→ **도메인 지식을 내재화하면서도, Orchestration 및 Function Calling 능력을 유지하는 sLLM 개발**이 목표

---

## 🔧 기술 스택

| 분류 | 기술 |
| --- | --- |
| **모델 서빙** | vLLM, llama.cpp |
| **데이터 파싱** | PaddleOCR, DeepSeek-OCR |
| **인프라** | NVIDIA L40S (사내 서버) |
| **Base 모델** | A.X-4.0-Light |
| **학습 프레임워크** | LLaMA-Factory |

---

## 🏗️ 개발 프로세스

```markdown
      Phase 1. Base 모델 선정
                │
                ▼
      Phase 2. 학습 데이터셋 구축
  ┌─────────────┼───────────────┐
	│             │               │
  ▼             ▼               ▼
해양 도메인   Instruction      Function
데이터셋       Following       Calling
(주력)         데이터셋          데이터셋
              (보조)           (보조)
					      │
					      ▼
		 Phase 3. CPT 학습 (진행 중)
                │
                ▼
     Phase 4. 평가 및 검증 (예정)
```

---

## 💡 핵심 구현 & 의사결정

### Challenge 1: 해양 도메인 데이터셋 구축

클라이언트로부터 받은 원천 데이터는 대부분 문서(PDF 등) 형태로, 학습에 바로 사용할 수 없는 상태

- **OCR 파싱**: PaddleOCR / DeepSeek-OCR를 활용하여 텍스트 추출
- **검수**: OCR 결과의 정확도가 일정하지 않아, gpt-oss-120b(Q4_K_M)를 활용한 자동 검수 진행
- **해양 용어 수집**: 웹크롤링을 통해 해양 도메인 전문 용어를 별도 수집
- **결과**: 샘플 데이터 기준 약 120만 토큰 규모의 해양 도메인 데이터셋 구축 완료

### Challenge 2: Catastrophic Forgetting 방지를 위한 학습 전략 설계

CPT(Continued Pre-Training)로 도메인 지식을 주입하되, Base 모델의 범용 능력이 훼손되는 Catastrophic Forgetting을 최소화해야 하는 과제

- **접근**: 도메인 데이터셋만으로 학습하지 않고, 학습 데이터를 3종으로 구성:
    - **해양 도메인 데이터셋** (주력) — 도메인 지식 내재화
    - **Instruction Following 데이터셋** (보조) — 일반적인 지시 수행 능력 보존
    - **Function Calling 데이터셋** (보조) — Agent Orchestration 능력 보존
- **비율 조율**: 도메인 데이터셋을 주력으로 하되, Instruction Following과 Function Calling 데이터셋은 적은 비율로 혼합하여 Base 모델의 범용 능력 유지와 도메인 특화 사이의 균형을 도모
- **근거**: Catastrophic Forgetting 방지 관련 논문 조사를 기반으로 학습 전략 수립

### Challenge 3: Base 모델 선정

HuggingFace 기반 Text Generation 모델 중 한국어 성능과 라이선스를 고려하여 후보 모델을 탐색

- **평가 방식**: 사내 GPU 서버(L40S)에서 직접 추론 테스트 수행. OOM 발생 시 Quantization 모델로 대체 평가
    - vLLM: Full-precision 모델 서빙
    - llama.cpp: Quantized 모델 서빙
- **최종 선정**: A.X-4.0-Light

---

## 📈 현재까지의 성과

| 지표 | 수치 |
| --- | --- |
| **학습 데이터 구성** | 해양 도메인 + Instruction Following + Function Calling |
| **현재 단계** | CPT 학습 진행 중 |
| **구축 데이터셋 규모** | 약 120만 토큰 (샘플 데이터 기준) |
| **Base 모델** | A.X-4.0-Light |
- Base 모델 선정부터 데이터셋 구축, 학습 전략 설계까지 LLMOps 파이프라인 전반을 주도적으로 수행

---

## 💭 회고 & 학습

### 잘한 점

- Catastrophic Forgetting 방지를 위해 논문 조사 기반으로 학습 전략을 수립하고, 도메인 / Instruction Following / Function Calling 3종 데이터셋 혼합 방식을 설계한 점
- OCR 파싱부터 학습 데이터 생성까지의 전 과정을 파이프라인으로 구축한 점

### 아쉬운 점

- GPU 리소스(L40S)가 제한적이어 다양한 학습 실험을 시도하기 어려운 환경
- 샘플 데이터 기준으로 구축된 데이터셋 규모가 충분하지 않아, 학습 효과 검증에 한계가 있음

### 향후 계획

- 추가 데이터 수령 후 데이터셋 확장 및 학습 고도화 예정
- 도메인 특화 벤치마크 및 평가 체계 수립을 통한 정량적 성능 검증 계획

---

## 📌 비고

- 본 프로젝트는 진행 중이며, Phase 3(CPT 학습) 단계에 해당
- 개발 1인(본인) + PM(선임) 2인 체제로 진행
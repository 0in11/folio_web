> 단일 텍스트 프롬프트로부터 상호작용형 VR 장면을 생성하는 End-to-End 모듈형 파이프라인
> 

---

## 📋 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| **소속** | 상명대학교 휴먼지능정보공학전공 졸업 프로젝트 |
| **한 줄 요약** | 텍스트 → 파노라마 생성 → 객체 분할 → 3D 복원 → VR 배포까지의 End-to-End 파이프라인 |
| **기간** | 2025.01 ~ 2025.11 (약 11개월) |
| **인원** | 4인 (팀 기라사니) |
| **논문** | KCI 등재 — 컴퓨터게임및콘텐츠논문지 (2025) |

---

## ❓ 문제 정의

기존 VR 콘텐츠 제작은 전문 인력과 장시간의 수작업이 필요하여 높은 비용과 제작 병목이 발생하는 상황. Text-to-3D 기술이 주목받고 있으나, 대부분의 연구는 **문맥을 반영하지 못한 단일 3D 오브젝트 생성**이나 **상호작용이 불가능한 정적 장면**에 머무르고 있었음

**핵심 과제:**

- 텍스트 한 줄만으로 의미적으로 일관된 배경과 **상호작용 가능한 객체**들이 함께 구성된 반응형 VR 공간을 자동 생성해야 함
- 파노라마 생성 → 객체 분할·복원 → 배경 보정 → 3D 복원 → 자동 정합까지의 복잡한 과정을 하나의 파이프라인으로 통합해야 함
- 비개발자도 텍스트 입력만으로 VR 공간을 생성·체험할 수 있는 환경이 필요

→ **다수의 AI 모듈을 LangGraph로 오케스트레이션하여, 텍스트로부터 인터랙티브 VR 장면까지 생성하는 모듈형 자동화 파이프라인 구축**이 목표

> *Pipeline Overview*
> 

![voerview.png](attachment:2aa95c56-e6db-4de5-b044-a6c7d9db1f2d:image.png)

---

## 🔧 기술 스택

| 분류 | 기술 |
| --- | --- |
| **Frontend** | React (단계별 진행 현황 및 중간 결과 확인) |
| **Backend** | LangGraph (파이프라인 오케스트레이션, 상태 관리, 재시도/로깅) |
| **파노라마 생성** | StitchDiffusion, DreamScene360 (GPT 기반 self-refinement) |
| **객체 분할** | GPT VLM (에셋 후보 검출) + Grounding SAM (2D 마스크 추출) |
| **배경 복원** | SD-Inpaint |
| **3D 복원** | Trellis (에셋), DreamScene360 (배경 → 3DGS PLY) |
| **자동 정합** | FlashSculptor (위치·방향·스케일 자동 정합, 단안 깊이 + 기하학적 priors) |
| **VR 렌더링** | Unity (HMD 기반 VR 렌더링) |
| **배포** | GCP 인스턴스 |
| **컨테이너** | Docker Compose (각 단계별 독립 API 서버) |

---

## 💡 핵심 구현 & 의사결정

### Challenge 1: 5단계 End-to-End 파이프라인 설계

각기 독립적인 AI 모듈들을 하나의 일관된 흐름으로 연결해야 하는 상황. 총 5단계의 파이프라인을 설계하고 구현

**Stage 1 — Text-to-Panorama**

- StitchDiffusion으로 360° Panoramic Image 생성
- DreamScene360 방식의 self-refinement 루프를 GPT로 구현하여 품질 향상

**Stage 2 — VLM-based Object Segmentation**

- GPT 기반 VLM으로 에셋 후보를 검출하고, Grounding SAM으로 각 후보의 2D 마스크를 자동 추출

**Stage 3 — Background Inpainting**

- 에셋 영역을 제거한 파노라마에 SD-Inpaint로 복원하여 시각적 일관성 확보

**Stage 4 — 3D Generation**

- 단일 뷰 3D 복원 모델인 Trellis로 상호작용 가능한 3D 에셋 생성
- DreamScene360 방법론으로 배경을 3D Gaussian Splat 형식의 PLY로 변환

**Stage 5 — Auto-Alignment**

- FlashSculptor 방법론을 적용하여 에셋의 위치·방향·스케일을 배경 좌표계에 자동 정합
- Original Panoramic Image의 단안 깊이와 기하학적 priors를 보조 신호로 사용

### Challenge 2: 시스템 아키텍처 및 클라우드 배포

GCP 인스턴스를 처음 사용하는 상황에서, 무거운 AI 모듈들을 안정적으로 서빙해야 하는 상황

- **LangGraph 백엔드**: 전체 파이프라인의 상태 관리, 재시도 및 로깅 기능 제공
- **Docker Compose**: 각 파이프라인 단계를 독립적인 Docker Container로 분리하되 일괄 관리. 각 컨테이너가 독립적인 API 서버로 동작하여 GCP의 GPU 리소스를 효율적으로 분배
- **Web UI**: 사용자에게 텍스트를 입력받고, 각 단계별 진행 현황 및 중간 결과를 확인할 수 있는 인터페이스 제공
- **Unity 연동**: 최종 산출물(3D 배경, 에셋, Transform 정보)을 패키징하여 Unity 환경에 전송 → HMD(VR 기기)에서 렌더링

> *System Architecture*
> 

![architecture.png](attachment:f904759c-4a13-4c72-b327-dad0fdf7d088:image.png)

### Challenge 3: 생소한 VR 도메인 학습

VR이라는 도메인이 생소했지만, 프로젝트 과정에서 3D Gaussian Splatting, 메쉬 변환, VR 환경 등 관련 기술들을 집중적으로 리서치하며 도메인 이해도를 높임

---

## 🙋‍♂️ 담당 역할

- **System Architecture 설계 및 구현**: 전체 5단계 파이프라인 구조 설계
- **Backend 구현**: LangGraph 기반 파이프라인 오케스트레이션, 상태 관리, 재시도/로깅
- **Frontend 구현**: 웹 기반 사용자 인터랙션 UI (단계별 진행 현황, 중간 결과 확인)
- **컨테이너화 및 배포**: Docker Compose + GCP 인스턴스 배포, GPU 리소스 분배

---

## 📈 성과 & 임팩트

- **KCI 논문 게재**: 「Text2VR: 단일 텍스트 프롬프트 기반 상호작용형 VR 장면 생성 모듈형 파이프라인」, 컴퓨터게임및콘텐츠논문지, 2025
- **졸업 발표회 우수상** 수상
- 텍스트로부터 인터랙티브 VR까지의 End-to-End 파이프라인을 제안

> *Rendered VR Scene 결과물 이미지*
> 

![ivr_scene.png](attachment:c74c03dd-555e-4df2-b20b-8aff6d199ffd:image.png)

---

## 💭 회고 & 학습

### 잘한 점

- GCP 인스턴스에 Docker Compose로 배포까지 완료하여, 클라우드 환경에서의 AI 서비스 운영 경험을 쌓은 점
- Backend(LangGraph 파이프라인) + Frontend(웹 UI) + 배포(Docker + GCP)까지 전체 스택을 직접 구현한 점
- 생소한 VR 도메인을 프로젝트 과정에서 집중적으로 학습한 점

### 아쉬운 점

- 각 AI 모듈(StitchDiffusion, Grounding SAM, Trellis 등)을 직접 개발한 것이 아니라 기존 모듈을 활용한 것이어서, 모듈 자체에 대한 깊은 이해가 부족했다는 점
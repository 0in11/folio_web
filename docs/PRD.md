PRD: Jin YoungIn Portfolio Website

Version: 2.0
Created: 2026-03-02
Status: Revised Draft

1. 프로젝트 개요
1.1 목적

Notion 중심으로 정리된 포트폴리오를 독립적인 개인 웹사이트로 전환한다.
이 사이트는 단순한 이력 정리가 아니라, AI 엔지니어로서의 전문성·기술적 깊이·문제 해결 방식을 명확하게 전달하는 브랜딩 자산이어야 한다.

1.2 핵심 목표

이 사이트의 목표는 세 가지다.

첫인상 10초 안에 정체성을 전달한다.
방문자가 “무슨 일을 하는 사람인지”를 즉시 이해할 수 있어야 한다.

프로젝트 중심으로 실력을 설득한다.
단순한 기술 나열이 아니라, 실제로 어떤 문제를 어떤 방식으로 풀었는지 보여줘야 한다.

과하지 않지만 고급스럽게 보인다.
AI가 자동 생성한 포트폴리오 템플릿처럼 보이지 않고, 절제된 미감과 높은 완성도를 갖춘 사이트여야 한다.

1.3 타겟 오디언스
대상	이 사이트에서 보고 싶은 것
채용 담당자 / HR	한눈에 보이는 경력 요약, 대표 프로젝트, 기술 키워드
기술 리드 / CTO	프로젝트별 문제 정의, 아키텍처, 의사결정, 기술적 난이도
동료 개발자	사용 기술, 구현 방식, 설계 사고, GitHub/논문
협업 파트너	전문 분야, 관심 주제, 연락 가능 채널
1.4 이 사이트가 전달해야 하는 인상

이 사이트는 다음 이미지를 전달해야 한다.

실험용 AI가 아니라 실제로 작동하는 AI 시스템을 만드는 사람

RAG, Agent, LLMOps, 도메인 특화 LLM을 현업 문제에 연결할 수 있는 엔지니어

과장 없이 담백하지만, 결과물과 구조에서 실력이 느껴지는 사람

2. 브랜드 방향
2.1 핵심 컨셉

Engineered Clarity
복잡한 AI 기술을 정제된 구조와 명확한 결과물로 보여주는 포트폴리오

2.2 톤 앤 무드

시각적으로는 화려한 미래지향 SF 감성보다, 아래 방향을 따른다.

절제된 다크 테마

강한 타이포그래피

정돈된 그리드

제한된 포인트 컬러

조용하지만 정교한 인터랙션

즉, “트렌디한 개발자 사이트”보다
**“브랜딩이 잘 된 기술 포트폴리오”**에 가깝게 설계한다.

2.3 반드시 피해야 할 방향

아래 요소는 사이트를 값싸 보이게 하거나, AI 템플릿 느낌을 강하게 만들 수 있으므로 제한한다.

과도한 글래스모피즘

과도한 블러 효과

네온 느낌의 강한 발광

파티클/배경 효과 남발

섹션마다 다른 애니메이션 패턴

벤토 그리드를 “유행 따라 넣은 느낌”으로 과하게 사용

너무 많은 카드, 너무 많은 정보, 너무 많은 강조

3. 디자인 원칙
3.1 핵심 디자인 원칙

정보 위계가 먼저다.
장식보다 콘텐츠가 우선이다.

큰 차이는 타이포와 간격으로 만든다.
색, 효과, 장식보다도 크기와 여백으로 품질을 만든다.

포인트는 적게 쓴다.
악센트 컬러와 특수 효과는 핵심 메시지에만 사용한다.

움직임은 설명을 돕는 범위까지만 쓴다.
멋을 위한 모션보다 이해를 돕는 모션만 허용한다.

모든 섹션이 주인공이면 안 된다.
Hero와 Featured Projects가 가장 강해야 하며, 나머지는 보조적으로 정리한다.

3.2 시각적 인상 목표

이 사이트는 아래 세 단어로 요약되는 것이 이상적이다.

정제된

기술적인

신뢰감 있는

4. 정보 구조 (Information Architecture)
4.1 사이트 구조
/                          → 메인 페이지
  ├─ Hero
  ├─ Selected Projects
  ├─ Career Snapshot
  ├─ About
  ├─ Skills
  ├─ Awards & Publications
  ├─ Education & Certifications
  └─ Contact

/projects/[slug]           → 프로젝트 상세 페이지
4.2 구조 설계 원칙

기존 단일 페이지 구조는 유지하되, About보다 프로젝트를 앞에 배치한다.
이유는 첫인상에서 자기소개보다 결과물과 문제 해결 능력이 더 설득력이 크기 때문이다.

4.3 네비게이션

상단 고정 네비게이션

스크롤 시 배경이 아주 미세하게 변하는 정도의 반투명 처리

섹션 링크: Projects / Career / About / Skills / Awards / Contact

모바일: 전체 화면 오버레이 메뉴

네비게이션은 눈에 띄기보다 조용하게 보조하는 역할을 한다

5. 섹션별 상세 기획
5.1 Hero Section
목적

방문자가 5~10초 안에 다음을 이해하게 한다.

이름

어떤 분야의 엔지니어인지

무엇을 잘하는지

대표 작업을 어디서 볼 수 있는지

필수 콘텐츠

이름: 진영인

역할 정의: 단순한 “AI Engineer”보다 조금 더 구체적인 포지셔닝 문장

한 줄 소개

CTA 1개 또는 2개

Selected Projects 보기

Resume 다운로드

권장 카피 방향

카피는 추상적인 성장 서사보다 전문 분야가 먼저 드러나야 한다.

예시 방향:

AI Engineer building production-ready RAG, agents, and domain LLM systems

도메인 지식을 실제 작동하는 AI 시스템으로 연결하는 엔지니어

RAG, Agent, LLMOps 기반의 실서비스형 AI 시스템 구현

레이아웃

풀스크린 또는 거의 풀스크린 높이

좌측 정렬 기반

이름과 역할 중심의 단단한 타이포 구성

배경은 조용해야 하며, 시각적 소음이 없어야 함

애니메이션

첫 진입 시 간단한 페이드/슬라이드 정도

타이핑 애니메이션은 과하면 촌스러워질 수 있으므로 매우 절제해서 사용하거나 생략 가능

5.2 Selected Projects Section
목적

이 사이트의 핵심 섹션이다.
가장 먼저 보여줘야 할 것은 자기소개가 아니라 대표 프로젝트다.

구성 원칙

전체 프로젝트 9개를 동일한 무게로 보여주지 않는다.

Featured Projects 3개

More Projects 나머지

Featured 대상 추천

[SURESOFT] 해양 법령 GraphRAG

[KoDATA] On-Premise Chatbot

[SURESOFT] 도메인 특화 sLLM 개발

카드에 포함할 정보

프로젝트명

소속

한 줄 설명

기간 / 팀 규모

핵심 기술

가장 중요한 성과 1줄

상세 보기 링크

카드 디자인 원칙

카드 스타일은 1종 또는 2종 이내로 제한

호버 효과는 미세한 elevation 정도만 허용

뱃지/태그는 많지 않게, 핵심만 노출

텍스트가 주인공이어야 하며, 장식은 보조 수준이어야 함

5.3 Project Detail Page
목적

프로젝트 상세 페이지는 포트폴리오의 진짜 실력을 보여주는 공간이다.
단순한 요약이 아니라 **문제 해결 사례집(case study)**처럼 보여야 한다.

구조

프로젝트 개요

문제 정의

역할과 책임

시스템 구조 / 아키텍처

핵심 구현 및 기술적 의사결정

성과 및 임팩트

회고 및 학습

개요에 포함할 항목

기간

소속

역할

인원

기술 스택

프로젝트 목표

핵심 구현 섹션 원칙

단순히 “무엇을 했다”가 아니라 아래 흐름으로 쓴다.

문제 상황

왜 이것이 어려웠는지

어떤 대안을 검토했는지

최종 선택 이유

결과

즉,
Challenge → Decision → Implementation → Result 구조를 기본 템플릿으로 삼는다.

상세 페이지 톤

중앙 정렬 아티클 레이아웃

코드/기술 태그는 모노 폰트 사용

섹션 간격 넉넉하게

아코디언은 꼭 필요한 경우만 사용

5.4 Career Snapshot Section
목적

경력의 흐름을 빠르게 이해시키는 섹션이다.
자세한 자기소개보다, 어떤 환경에서 어떤 종류의 문제를 다뤄왔는지 보여준다.

데이터

2025.03~09 한국평가데이터 (인턴)

2025.09~12 슈어소프트테크 (인턴)

2025.12~ 슈어소프트테크 (전임연구원)

표현 방식

전통적인 화려한 타임라인보다,
깔끔한 vertical list + 핵심 태그 형식도 충분히 고려할 수 있다.

예:

직무

회사

기간

대표 키워드 2~3개

추천 방향

완전한 좌우 교차형 타임라인은 예쁘지만 구현 대비 효과가 작을 수 있다.
브랜드 방향상 더 미니멀한 세로형 리스트가 오히려 고급스럽게 보일 가능성이 높다.

5.5 About Section
목적

사람 소개보다는, 엔지니어로서의 성향과 강점을 짧고 명확하게 전달한다.

추천 구성

짧은 소개 문단

강점 3가지

핵심 지표 2~4개

미니 연락처 정보

강점 예시 방향

복잡한 도메인을 빠르게 구조화하는 능력

RAG / Agent / LLM 시스템을 실제 서비스 문맥으로 연결하는 능력

제품 관점과 구현 관점을 함께 보는 태도

주의점

여기서 감성적인 자기서사를 길게 쓰면 전체 톤이 약해질 수 있다.
About은 짧고 단단해야 한다.

5.6 Skills Section
목적

기술을 많이 안다는 인상을 주는 게 아니라,
무엇을 실제로 잘하는지를 명확히 보여주는 것이 목적이다.

구조

기술을 아래 세 그룹으로 나눈다.

Core Stack

Worked With

Tooling / Environment

예시 분류

Core Stack

Python

FastAPI

LangGraph

LangChain

vLLM

ElasticSearch

PostgreSQL

Docker

Linux

Worked With

TypeScript

React

Svelte

Node.js

Redis

SQLite

Neo4j

llama.cpp

FastMCP

Tkinter

Tooling / Environment

Git

Docker

Linux

On-premise environment

API integration

evaluation / automation pipelines

표현 방식

기술 숙련도를 퍼센트 바처럼 표현하지 않는다

“전문 / 경험” 정도의 구분은 가능하되 과하게 수치화하지 않는다

아이콘 남발보다, 텍스트와 위계 중심으로 설계한다

5.7 Awards & Publications Section
목적

성과를 추가 증거로 제시하는 보조 섹션이다.
이 섹션이 메인보다 강하면 안 된다.

포함 내용

Awards

2024.05 — SW중심대학사업 AI·클라우드 공모전 우수상

2025.11 — Human AI Studio Festival 2025 우수상

Publication

Text2VR: 단일 텍스트 프롬프트 기반 VR 장면 생성 모듈형 파이프라인

KCI 등재, 2025

DOI 링크

표현 방식

2컬럼 또는 stacked cards

수상/논문 아이콘은 절제해서 사용

논문은 제목과 성격이 더 잘 보이도록 배치

5.8 Education & Certifications Section
포함 내용

상명대학교 휴먼지능정보공학 (4.1/4.5)

AWS Certified AI Practitioner (2026.02)

정보처리기능사 (2023.06)

OPIc IM2 (2025.09)

원칙

이 섹션은 신뢰 보강용이다.
과도하게 크게 보일 필요는 없다.

5.9 Contact Section
목적

마지막 인상을 정리하고, 연락 행동을 유도한다.

필수 콘텐츠

짧은 CTA 헤드라인

이메일

GitHub

Thread

헤드라인 방향

“함께 일해보고 싶으시다면”처럼 무난한 문장도 가능하지만,
조금 더 단단한 문장이 좋다.

예:

함께 만들고 싶은 AI 시스템이 있다면

문제를 실제로 작동하는 AI로 풀고 싶다면

협업 제안이나 문의는 아래로 연락 주세요

디자인 원칙

마지막 섹션은 너무 화려하지 않게

대신 사이트 전체 톤을 잘 정리하는 마감 역할

CTA 버튼은 1개면 충분할 수 있음

6. 비주얼 시스템
6.1 컬러 팔레트

기본적으로 기존 팔레트는 유지 가능하나, 사용 원칙을 더 명확히 한다.

Background Primary:   #0A0A0F
Background Secondary: #12121A
Surface:              #171722
Surface Hover:        #1D1D2B

Accent Primary:       #60A5FA
Accent Secondary:     #818CF8

Text Primary:         #F1F5F9
Text Secondary:       #A8B3C7
Text Muted:           #64748B

Border Subtle:        rgba(255,255,255,0.08)
Border Strong:        rgba(255,255,255,0.14)

Success:              #34D399
6.2 컬러 사용 원칙

블루 계열은 포인트로만 사용

화면 전체를 그라데이션으로 덮지 않는다

성과 수치, 링크, 강조 문구 정도에만 제한적으로 사용

카드마다 다른 강조색을 주지 않는다

6.3 타이포그래피
Display: Syne
Heading: Plus Jakarta Sans
Body: Plus Jakarta Sans
Mono: JetBrains Mono
6.4 타이포 원칙

Hero만 크고, 나머지는 절제

Heading 간 차이를 분명히 둔다

본문은 지나치게 작지 않게

모노 폰트는 태그/메타 정보/기술 키워드에만 사용

6.5 레이아웃
Max Width:            1200px ~ 1280px
Article Width:        720px ~ 768px
Section Padding:      96px ~ 120px desktop / 72px ~ 88px mobile
Border Radius:        14px ~ 18px
6.6 카드 스타일 원칙

카드 종류는 가능한 적게 유지

얕은 그림자 + 얇은 보더 중심

blur는 최소한으로 사용

카드보다 내부 정보 정렬이 더 중요하다

7. 인터랙션 원칙
7.1 애니메이션 철학

모션은 “보여주기 위한 장식”이 아니라
정보를 더 잘 이해하게 만드는 장치여야 한다.

7.2 허용되는 모션

첫 진입 시 간단한 reveal

카드 hover 시 미세한 위치 이동 또는 shadow 변화

스크롤에 따른 section reveal

프로젝트 상세 전환 시 부드러운 페이지 진입

7.3 제한해야 할 모션

강한 패럴랙스

과도한 stagger

긴 타이핑 애니메이션

카드마다 다른 hover 연출

배경에서 계속 움직이는 시각 요소

7.4 접근성

prefers-reduced-motion 대응 필수

키보드 포커스 스타일 명확히 제공

대비 충분히 확보

장식 요소는 콘텐츠를 방해하지 않아야 함

8. 콘텐츠 전략
8.1 가장 중요한 콘텐츠 원칙

이 사이트는 “무엇을 배웠는가”보다
무엇을 만들었고 어떤 문제를 해결했는가가 중심이어야 한다.

8.2 프로젝트 서술 원칙

모든 프로젝트에서 아래 질문에 답할 수 있어야 한다.

어떤 문제였는가

왜 어려웠는가

내가 맡은 역할은 무엇이었는가

무엇을 설계/구현했는가

결과는 무엇이었는가

어떤 판단이 중요했는가

8.3 숫자 사용 원칙

가능하면 정량 지표를 적극 활용한다.

예:

처리 시간 단축

의견 작성 시간 감소

정확도 향상

생산성 개선

시스템 구축 범위

사용자 수 / 적용 환경 / 배포 조건

8.4 텍스트 톤

과장하지 않는다

추상어를 줄인다

“혁신”, “열정”, “도전” 같은 단어는 남발하지 않는다

대신 구체적인 구현과 결과로 설득한다

9. 기술 스택 및 구현 방향
9.1 Core Stack
분류	기술	비고
Framework	Next.js 15	App Router
Language	TypeScript	타입 안정성
Styling	Tailwind CSS	빠른 구축, 일관성
Animation	Framer Motion	절제된 모션
Icon	Lucide React	최소 사용
Fonts	next/font + Google Fonts	성능 최적화
9.2 구현 원칙

기본은 SSG 중심

프로젝트 상세도 정적 생성 우선

이미지 최적화 적극 활용

폰트는 next/font 사용

데이터는 우선 data/ TS 파일로 관리

추후 MDX 또는 Notion API로 확장 가능

9.3 폴더 구조
portfolio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── projects/
│       └── [slug]/
│           └── page.tsx
├── components/
│   ├── layout/
│   ├── sections/
│   └── ui/
├── data/
├── lib/
├── public/
└── ...
10. SEO & 메타데이터
10.1 기본 메타데이터
title: Jin YoungIn | AI Engineer Portfolio
description: AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.
10.2 SEO 원칙

프로젝트별 개별 메타데이터 제공

Open Graph 이미지 커스텀

sitemap.xml / robots.txt 구성

구조화 데이터는 필요 시 Person / Article / CreativeWork 수준 검토

10.3 SEO보다 중요한 것

이 사이트는 검색 유입보다 직접 공유/검토되는 포트폴리오 성격이 강하므로,
SEO는 기본만 갖추고 가독성과 설득력을 더 우선한다.

11. 성능 & 품질 기준
11.1 목표

Lighthouse 90+ 목표

LCP < 2.5s

CLS < 0.1

모바일에서도 타이포와 간격이 무너지지 않도록 유지

11.2 최적화 전략

이미지 최소화

불필요한 애니메이션 제거

dynamic import는 꼭 필요한 부분에만 적용

폰트 weight 남발 금지

반복 UI 컴포넌트 최소화

11.3 접근성 기준

시맨틱 구조

키보드 탐색 가능

충분한 대비

명확한 focus state

링크/버튼 상태 구분 가능

12. 배포 전략
12.1 우선 배포 플랫폼

Vercel

12.2 기본 주소

youngin-jin.vercel.app

12.3 추후 확장

커스텀 도메인 연결

간단한 방문자 분석 도입 가능

다국어 지원은 2차 확장 범위

13. 개발 우선순위
Phase 1

디자인 토큰 정의

기본 레이아웃

Hero

Selected Projects

Phase 2

Career

About

Skills

Phase 3

Awards / Education / Contact

프로젝트 상세 페이지 템플릿

Phase 4

모션 정리

반응형 정리

SEO / 메타데이터

QA / 성능 최적화

14. 성공 기준

이 프로젝트는 아래 조건을 만족하면 성공이다.

첫 화면만 보고도 무슨 일을 하는 사람인지 설명할 수 있다

대표 프로젝트 2~3개만 봐도 실력이 느껴진다

UI가 과하지 않고 브랜딩이 정돈되어 있다

개발자 포트폴리오 템플릿처럼 보이지 않는다

채용 담당자와 기술 리드 모두에게 읽히는 구조를 가진다

15. 한 줄 디자인 디렉션

“조용하지만 강한 기술 포트폴리오. 화려함보다 구조, 장식보다 설득.”
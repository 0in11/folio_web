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

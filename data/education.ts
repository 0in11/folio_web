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

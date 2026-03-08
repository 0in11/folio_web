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

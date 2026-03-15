export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface DetailSection {
  title: string;
  content?: string;
  image?: ProjectImage;
  imagePosition?: "before" | "after";
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
  markdownContent?: string;
  links?: {
    github?: string;
    demo?: string;
    paper?: string;
  };
}

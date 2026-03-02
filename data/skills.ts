export interface SkillGroup {
  label: string;
  description: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Core Stack",
    description: "실무에서 주로 사용하는 기술",
    items: [
      "Python", "FastAPI", "LangGraph", "LangChain",
      "vLLM", "ElasticSearch", "PostgreSQL", "Docker", "Linux",
    ],
  },
  {
    label: "Worked With",
    description: "프로젝트에서 경험한 기술",
    items: [
      "TypeScript", "React", "Svelte", "Node.js", "Redis",
      "SQLite", "Neo4j", "llama.cpp", "FastMCP", "Tkinter",
    ],
  },
  {
    label: "Tooling & Environment",
    description: "개발 환경 및 운용",
    items: [
      "Git", "Docker", "Linux", "On-premise",
      "API Integration", "Eval / Automation Pipelines",
    ],
  },
];

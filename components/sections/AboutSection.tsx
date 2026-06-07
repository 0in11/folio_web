import FadeIn from "@/components/ui/FadeIn";
import {
  fetchFeaturedProjects,
  fetchMoreProjects,
  fetchCareerHistory,
  fetchAwards,
  fetchPublications,
} from "@/lib/payload";

const strengths = [
  {
    title: "도메인 이해 기반 문제 정의",
    description:
      "업무 맥락과 데이터 흐름을 먼저 이해하고, AI가 풀어야 할 문제를 구체화합니다.",
  },
  {
    title: "기획부터 아키텍처 설계까지",
    description:
      "LLM, Agent, RAG를 서비스 목적에 맞게 조합하고, 운영 가능한 구조로 설계합니다.",
  },
  {
    title: "실행 가능한 AI 서비스 구현",
    description:
      "아이디어 단계에 머무르지 않고, 검증 가능한 프로토타입과 실제 동작하는 시스템까지 개발합니다.",
  },
];

export default async function AboutSection() {
  const [featured, more, career, awards, publications] = await Promise.all([
    fetchFeaturedProjects(),
    fetchMoreProjects(),
    fetchCareerHistory(),
    fetchAwards(),
    fetchPublications(),
  ]);

  const projectCount = featured.length + more.length;
  const companyCount = new Set(career.map((c) => c.company)).size;

  const stats = [
    { value: `${projectCount}+`, label: "Projects" },
    { value: String(companyCount), label: "Companies" },
    { value: String(publications.length), label: publications.length === 1 ? "Publication" : "Publications" },
    { value: String(awards.length), label: awards.length === 1 ? "Award" : "Awards" },
  ];
  return (
    <section id="about" className="py-section-mobile md:py-section px-6" aria-labelledby="about-heading">
      <div className="max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Text */}
          <FadeIn>
            <div>
              <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
                About
              </p>
              <h2
                id="about-heading"
                className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6"
              >
                도메인 이해에서
                <br />
                AI 서비스 구현까지.
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                도메인에 대한 이해를 바탕으로 AI 서비스의 방향을 기획하고,
                필요한 데이터 구조와 시스템 아키텍처를 설계합니다.
                RAG, Agent, LLMOps 같은 기술을 목적에 맞게 조합해
                아이디어가 실제 사용자 흐름 안에서 작동하는 서비스가 되도록 개발합니다.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-3xl font-bold text-accent-primary">
                      {stat.value}
                    </div>
                    <div className="font-mono text-xs text-text-muted mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Right: Strengths */}
          <FadeIn delay={0.15}>
            <div>
              <h3 className="font-mono text-xs text-text-muted tracking-widest uppercase mb-6">
                Core Strengths
              </h3>
              <ul className="space-y-6">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="font-mono text-xs text-accent-primary mt-1 flex-shrink-0">
                      0{index + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-text-primary mb-1">
                        {strength.title}
                      </h4>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {strength.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

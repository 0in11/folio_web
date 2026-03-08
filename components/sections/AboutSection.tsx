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
    title: "도메인 구조화",
    description:
      "복잡한 도메인 지식을 빠르게 흡수하고, AI가 다룰 수 있는 구조로 정제합니다.",
  },
  {
    title: "시스템 연결",
    description:
      "RAG, Agent, LLMOps를 개별 기술이 아닌 실서비스 문맥에서 통합합니다.",
  },
  {
    title: "제품 & 구현 관점",
    description:
      "엔지니어링 결정이 제품에 어떤 영향을 미치는지 함께 고려하며 설계합니다.",
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
                도메인 지식을
                <br />
                AI로 연결합니다.
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                실제 현장에서 쓰이는 AI 시스템을 만드는 것을 목표로 합니다.
                단순한 프로토타입이 아니라, 온프레미스 서버에서 동작하는 RAG 챗봇,
                도메인 법령을 탐색하는 GraphRAG, 특화 데이터로 파인튜닝한 sLLM까지.
                문제를 정의하고, 기술을 선택하고, 작동하는 시스템을 납품합니다.
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

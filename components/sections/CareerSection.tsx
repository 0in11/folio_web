import { careerHistory } from "@/data/career";
import Badge from "@/components/ui/Badge";
import FadeIn from "@/components/ui/FadeIn";

export default function CareerSection() {
  return (
    <section id="career" className="py-section-mobile md:py-section px-6" aria-labelledby="career-heading">
      <div className="max-w-content mx-auto">
        <FadeIn className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Experience
          </p>
          <h2
            id="career-heading"
            className="font-display text-4xl md:text-5xl font-bold text-text-primary"
          >
            Career Snapshot
          </h2>
        </FadeIn>

        <div className="max-w-2xl space-y-0" role="list" aria-label={`${careerHistory.length}개의 경력 사항`}>
          {careerHistory.map((item, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="relative flex gap-6 pb-8" role="listitem">
                {/* Timeline line */}
                {index < careerHistory.length - 1 && (
                  <div
                    className="absolute left-[7px] top-4 bottom-0 w-px bg-border-subtle"
                    aria-hidden="true"
                  />
                )}

                {/* Dot */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 ${
                      item.current
                        ? "border-accent-primary bg-accent-primary/20 shadow-[0_0_8px_rgba(96,165,250,0.4)]"
                        : "border-border-strong bg-bg-surface"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <h3 className="font-display font-bold text-text-primary text-lg">
                      {item.company}
                    </h3>
                    <span className="font-mono text-sm text-text-muted">{item.role}</span>
                    {item.current && (
                      <span className="font-mono text-xs text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                        재직 중
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-text-muted mb-3">{item.period}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.map((keyword) => (
                      <Badge key={keyword}>{keyword}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

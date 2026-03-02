import { awards, publications } from "@/data/awards";
import { Trophy, BookOpen } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export default function AwardsSection() {
  return (
    <section id="awards" className="py-section px-6" aria-labelledby="awards-heading">
      <div className="max-w-content mx-auto">
        <FadeIn className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Recognition
          </p>
          <h2
            id="awards-heading"
            className="font-display text-4xl md:text-5xl font-bold text-text-primary"
          >
            Awards & Publications
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Awards */}
          <FadeIn>
            <div>
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <Trophy size={14} /> Awards
              </h3>
              <div className="space-y-4">
                {awards.map((award, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-card border border-border-subtle bg-bg-surface"
                  >
                    <span className="font-mono text-xs text-text-muted flex-shrink-0 mt-0.5">
                      {award.date}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{award.title}</p>
                      {award.organizer && (
                        <p className="font-mono text-xs text-text-muted mt-0.5">
                          {award.organizer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Publications */}
          <FadeIn delay={0.1}>
            <div>
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <BookOpen size={14} /> Publications
              </h3>
              <div className="space-y-4">
                {publications.map((pub, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-card border border-border-subtle bg-bg-surface"
                  >
                    <p className="text-sm font-medium text-text-primary mb-2 leading-relaxed">
                      {pub.title}
                    </p>
                    <p className="font-mono text-xs text-text-muted mb-1">{pub.journal}</p>
                    <p className="font-mono text-xs text-text-muted mb-2">{pub.year}</p>
                    {pub.doi && (
                      <a
                        href={pub.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-accent-primary hover:underline"
                      >
                        DOI →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

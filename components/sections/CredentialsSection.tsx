import { awards, publications } from "@/data/awards";
import { education, certifications } from "@/data/education";
import { GraduationCap, Trophy, Award, BookOpen } from "lucide-react";
import FadeIn, { STAGGER_DELAY } from "@/components/ui/FadeIn";

const parseDate = (d: string) => d.replace(".", "").padEnd(6, "0");

const sortedAwards = [...awards].sort((a, b) => parseDate(b.date).localeCompare(parseDate(a.date)));
const sortedCerts = [...certifications].sort((a, b) => parseDate(b.date).localeCompare(parseDate(a.date)));
const sortedPubs = [...publications].sort((a, b) => b.year - a.year);

export default function CredentialsSection() {
  return (
    <section
      id="credentials"
      className="py-section-mobile md:py-section px-6"
      aria-labelledby="credentials-heading"
    >
      <div className="max-w-content mx-auto">
        <FadeIn className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Awards & Education
          </p>
          <h2
            id="credentials-heading"
            className="font-display text-4xl md:text-5xl font-bold text-text-primary"
          >
            Credentials
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <FadeIn>
            <div className="h-full p-6 rounded-card border border-border-subtle bg-bg-surface">
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <GraduationCap size={14} /> Education
              </h3>
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-display font-bold text-text-primary">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">{edu.degree}</p>
                    {edu.gpa && (
                      <p className="font-mono text-xs text-accent-primary mt-1">
                        GPA {edu.gpa}
                      </p>
                    )}
                    <p className="font-mono text-xs text-text-muted mt-1">{edu.period}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Awards */}
          <FadeIn delay={1 * STAGGER_DELAY}>
            <div className="h-full p-6 rounded-card border border-border-subtle bg-bg-surface">
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy size={14} /> Awards
              </h3>
              <div className="space-y-3">
                {sortedAwards.map((award, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-mono text-xs text-text-muted w-16 flex-shrink-0 mt-0.5">
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

          {/* Certifications */}
          <FadeIn delay={2 * STAGGER_DELAY}>
            <div className="h-full p-6 rounded-card border border-border-subtle bg-bg-surface">
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <Award size={14} /> Certifications
              </h3>
              <div className="space-y-3">
                {sortedCerts.map((cert, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-mono text-xs text-text-muted w-16 flex-shrink-0 mt-0.5">
                      {cert.date}
                    </span>
                    <p className="text-sm text-text-primary">{cert.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Publications */}
          <FadeIn delay={3 * STAGGER_DELAY}>
            <div className="h-full p-6 rounded-card border border-border-subtle bg-bg-surface">
              <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={14} /> Publications
              </h3>
              <div className="space-y-3">
                {sortedPubs.map((pub, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-text-primary leading-relaxed">
                      {pub.title}
                    </p>
                    <p className="font-mono text-xs text-text-muted mt-1">{pub.journal}</p>
                    <p className="font-mono text-xs text-text-muted">{pub.year}</p>
                    {pub.doi && (
                      <a
                        href={pub.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-accent-primary hover:underline mt-1 inline-block"
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

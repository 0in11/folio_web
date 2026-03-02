import { education, certifications } from "@/data/education";

export default function EducationSection() {
  return (
    <section className="py-12 px-6" aria-labelledby="education-heading">
      <div className="max-w-content mx-auto">
        <h2
          id="education-heading"
          className="font-display text-3xl font-bold text-text-primary mb-8"
        >
          Education & Certifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Education */}
          <div>
            {education.map((edu, i) => (
              <div
                key={i}
                className="p-4 rounded-card border border-border-subtle bg-bg-surface"
              >
                <p className="font-display font-bold text-text-primary">{edu.institution}</p>
                <p className="text-sm text-text-secondary mt-1">{edu.degree}</p>
                {edu.gpa && (
                  <p className="font-mono text-xs text-accent-primary mt-1">GPA {edu.gpa}</p>
                )}
                <p className="font-mono text-xs text-text-muted mt-1">{edu.period}</p>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            {certifications.map((cert, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-card border border-border-subtle bg-bg-surface"
              >
                <p className="text-sm text-text-primary">{cert.name}</p>
                <span className="font-mono text-xs text-text-muted flex-shrink-0 ml-4">
                  {cert.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

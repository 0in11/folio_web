import { skillGroups } from "@/data/skills";
import FadeIn from "@/components/ui/FadeIn";

export default function SkillsSection() {
  return (
    <section id="skills" className="py-section px-6" aria-labelledby="skills-heading">
      <div className="max-w-content mx-auto">
        <FadeIn className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Tech
          </p>
          <h2
            id="skills-heading"
            className="font-display text-4xl md:text-5xl font-bold text-text-primary"
          >
            Skills
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillGroups.map((group, i) => (
            <FadeIn key={group.label} delay={i * 0.1}>
              <div>
                <div className="mb-4 pb-4 border-b border-border-subtle">
                  <h3 className="font-display font-bold text-text-primary text-lg">
                    {group.label}
                  </h3>
                  <p className="font-mono text-xs text-text-muted mt-1">
                    {group.description}
                  </p>
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 group"
                    >
                      <span
                        className="w-1 h-1 rounded-full bg-border-strong group-hover:bg-accent-primary transition-colors flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

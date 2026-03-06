import ProjectCard from "@/components/ui/ProjectCard";
import FadeIn, { STAGGER_DELAY } from "@/components/ui/FadeIn";
import { getFeaturedProjects, getMoreProjects } from "@/data/projects";

export default function ProjectsSection() {
  const featured = getFeaturedProjects();
  const more = getMoreProjects();

  return (
    <section id="projects" className="py-section-mobile md:py-section px-6" aria-labelledby="projects-heading">
      <div className="max-w-content mx-auto">
        {/* Section Header */}
        <FadeIn className="mb-12">
          <p className="font-mono text-xs text-accent-primary tracking-widest uppercase mb-3">
            Work
          </p>
          <h2
            id="projects-heading"
            className="font-display text-4xl md:text-5xl font-bold text-text-primary"
          >
            Selected Projects
          </h2>
        </FadeIn>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {featured.map((project, i) => (
            <FadeIn key={project.id} delay={i * STAGGER_DELAY} className="h-full">
              <ProjectCard project={project} featured />
            </FadeIn>
          ))}
        </div>

        {/* More Projects */}
        {more.length > 0 && (
          <>
            <FadeIn className="mb-6">
              <h3 className="font-display text-xl font-bold text-text-secondary">
                More Projects
              </h3>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {more.map((project, i) => (
                <FadeIn key={project.id} delay={i * STAGGER_DELAY} className="h-full">
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

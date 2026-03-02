import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/data/projects";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} | Jin YoungIn`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div className="pt-24 pb-section px-6">
      <div className="max-w-article mx-auto">
        {/* Back */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-sm text-text-muted hover:text-text-primary transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {/* Header */}
        <header className="mb-12">
          <p className="font-mono text-xs text-text-muted mb-2">{project.company}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {project.title}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-card border border-border-subtle bg-bg-surface mb-6">
            {[
              { label: "기간", value: project.period },
              { label: "팀 규모", value: project.teamSize },
              { label: "소속", value: project.company },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-mono text-xs text-text-muted mb-1">{label}</p>
                <p className="text-sm text-text-primary font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </header>

        {/* Key Achievement */}
        <div className="p-4 rounded-card border border-success/20 bg-success/5 mb-12">
          <p className="font-mono text-xs text-success mb-1">Key Achievement</p>
          <p className="text-text-primary">{project.keyAchievement}</p>
        </div>

        {/* Detail Content */}
        {project.detail ? (
          <article className="space-y-12">
            {[
              { title: "Problem", content: project.detail.problem },
              { title: "My Role", content: project.detail.role },
              { title: "Architecture", content: project.detail.architecture },
              { title: "Implementation", content: project.detail.implementation },
              { title: "Impact", content: project.detail.impact },
              { title: "Learnings", content: project.detail.learnings },
            ].map(({ title, content }) => (
              <section key={title}>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
                  {title}
                </h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {content}
                </p>
              </section>
            ))}
          </article>
        ) : (
          <div className="text-center py-16 text-text-muted">
            <p>상세 내용을 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

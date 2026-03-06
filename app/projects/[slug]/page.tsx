import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/data/projects";
import type { DetailSection, ProjectImage } from "@/data/projects";
import type { Metadata } from "next";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import FormattedContent from "@/components/ui/FormattedContent";
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

function SectionImage({ image }: { image: ProjectImage }) {
  return (
    <figure className="mt-6 rounded-card border border-border-subtle bg-bg-surface overflow-hidden">
      <div className="p-2">
        <Image
          src={image.src}
          alt={image.alt}
          width={1200}
          height={675}
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full h-auto rounded-sm"
        />
      </div>
      {image.caption && (
        <figcaption className="px-4 py-3 border-t border-border-subtle">
          <p className="font-mono text-xs text-text-muted text-center">
            {image.caption}
          </p>
        </figcaption>
      )}
    </figure>
  );
}

function SectionTable({
  rows,
  headers = ["분류", "기술"],
}: {
  rows: { label: string; value: string }[];
  headers?: [string, string];
}) {
  return (
    <div className="rounded-card border border-border-subtle bg-bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left font-mono text-xs text-text-muted px-4 py-2.5 w-[160px]">
              {headers[0]}
            </th>
            <th className="text-left font-mono text-xs text-text-muted px-4 py-2.5">
              {headers[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, value }) => (
            <tr
              key={label}
              className="border-b border-border-subtle last:border-b-0"
            >
              <td className="px-4 py-2.5 font-medium text-text-primary">
                {label}
              </td>
              <td className="px-4 py-2.5 text-text-secondary">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailSectionBlock({ section }: { section: DetailSection }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
        {section.title}
      </h2>

      {/* Image before content */}
      {section.image && (section.imagePosition ?? "before") === "before" && (
        <SectionImage image={section.image} />
      )}

      {/* Table */}
      {section.table && (
        <div className="mt-2">
          <SectionTable rows={section.table} headers={section.tableHeaders} />
        </div>
      )}

      {/* Content */}
      {section.content && (
        <div className={section.image || section.table ? "mt-6" : ""}>
          <FormattedContent content={section.content} />
        </div>
      )}

      {/* Image after content */}
      {section.image && (section.imagePosition ?? "before") === "after" && (
        <SectionImage image={section.image} />
      )}

      {/* Subsections */}
      {section.subsections && (
        <div className="mt-2 space-y-8">
          {section.subsections.map((sub) => (
            <div key={sub.title}>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-3">
                {sub.title}
              </h3>
              <FormattedContent content={sub.content} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
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
          project.detail.sections ? (
            <article className="space-y-12">
              {project.detail.sections.map((section) => (
                <DetailSectionBlock key={section.title} section={section} />
              ))}
            </article>
          ) : (
            <article className="space-y-12">
              {(
                [
                  { title: "Problem", content: project.detail.problem },
                  { title: "My Role", content: project.detail.role },
                  {
                    title: "Architecture",
                    content: project.detail.architecture,
                    image: project.detail.architectureImage,
                  },
                  { title: "Implementation", content: project.detail.implementation },
                  { title: "Impact", content: project.detail.impact },
                  { title: "Learnings", content: project.detail.learnings },
                ] as {
                  title: string;
                  content?: string;
                  image?: ProjectImage;
                }[]
              )
                .filter(({ content }) => content)
                .map(({ title, content, image }) => (
                  <section key={title}>
                    <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
                      {title}
                    </h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                      {content}
                    </p>
                    {image && <SectionImage image={image} />}
                  </section>
                ))}

              {project.detail.demoImages && project.detail.demoImages.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
                    Demo
                  </h2>
                  <div className="space-y-6">
                    {project.detail.demoImages.map((img) => (
                      <SectionImage key={img.src} image={img} />
                    ))}
                  </div>
                </section>
              )}
            </article>
          )
        ) : (
          <div className="text-center py-16 text-text-muted">
            <p>상세 내용을 준비 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Badge from "./Badge";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group block h-full rounded-card border border-border-subtle bg-bg-surface p-6",
        "flex flex-col",
        "hover:border-border-strong hover:bg-bg-hover transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        featured && "md:p-8"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-mono text-xs text-text-muted mb-1">{project.company}</p>
          <h3
            className={cn(
              "font-display font-bold text-text-primary group-hover:text-accent-primary transition-colors",
              featured ? "text-xl" : "text-lg"
            )}
          >
            {project.title}
          </h3>
        </div>
        <ArrowUpRight
          size={18}
          className="text-text-muted group-hover:text-accent-primary transition-colors flex-shrink-0 mt-1"
        />
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Achievement */}
      <p className="text-xs text-success mb-4 font-medium">
        → {project.keyAchievement}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-text-muted font-mono">{project.period}</span>
        <span className="text-text-muted">·</span>
        <span className="text-xs text-text-muted font-mono">{project.teamSize}</span>
      </div>

      {/* Tech Badges */}
      <div className="mt-auto flex min-h-[50px] content-start flex-wrap gap-1.5">
        {project.technologies.slice(0, 5).map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
    </Link>
  );
}

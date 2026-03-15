"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import type { Components } from "react-markdown";

interface ProjectMarkdownProps {
  content: string;
}

const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-display text-2xl font-bold text-text-primary mb-4 mt-12 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display text-lg font-semibold text-text-primary mb-3 mt-8">
      {children}
    </h3>
  ),
  p: ({ children, node }) => {
    const hasImage = node?.children?.some(
      (child) => child.type === "element" && child.tagName === "img"
    );
    if (hasImage) {
      return <>{children}</>;
    }
    return (
      <p className="text-text-secondary leading-relaxed mb-3">{children}</p>
    );
  },
  strong: ({ children }) => (
    <strong className="text-text-primary font-semibold">{children}</strong>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code className="block font-mono text-sm text-text-secondary whitespace-pre">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-sm bg-bg-hover px-1.5 py-0.5 rounded">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="rounded-card border border-border-subtle bg-bg-surface p-4 overflow-x-auto my-4">
      {children}
    </pre>
  ),
  ul: ({ children }) => <ul className="space-y-1.5 mb-3">{children}</ul>,
  ol: ({ children }) => (
    <ol className="space-y-1.5 mb-3 list-decimal pl-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-2.5 text-text-secondary leading-relaxed">
      <span className="text-text-muted shrink-0 select-none">-</span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent-primary/40 pl-4 my-4 text-text-muted italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="rounded-card border border-border-subtle bg-bg-surface overflow-hidden my-4">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border-subtle">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border-subtle last:border-b-0">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="text-left font-mono text-xs text-text-muted px-4 py-2.5">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-text-secondary">{children}</td>
  ),
  hr: () => <hr className="border-border-subtle my-10" />,
  img: ({ src, alt }) => {
    if (!src || typeof src !== "string") return null;
    return (
      <figure className="mt-6 mb-4 rounded-card border border-border-subtle bg-bg-surface overflow-hidden">
        <div className="p-2">
          <Image
            src={src}
            alt={alt ?? ""}
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto rounded-sm"
          />
        </div>
        {alt && alt !== src && (
          <figcaption className="px-4 py-3 border-t border-border-subtle">
            <p className="font-mono text-xs text-text-muted text-center">
              {alt}
            </p>
          </figcaption>
        )}
      </figure>
    );
  },
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-accent-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

export default function ProjectMarkdown({ content }: ProjectMarkdownProps) {
  return (
    <article className="project-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}

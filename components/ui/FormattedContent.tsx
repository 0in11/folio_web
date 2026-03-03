"use client";

import type { ReactNode } from "react";

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-sm bg-bg-hover px-1.5 py-0.5 rounded"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bullets.length === 0) return;
    elements.push(
      <ul key={key++} className="space-y-1.5">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-text-secondary leading-relaxed"
          >
            <span className="text-text-muted shrink-0 select-none">-</span>
            <span>{parseInline(b)}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
    } else if (line.startsWith("→ ")) {
      flushBullets();
      elements.push(
        <p
          key={key++}
          className="text-accent-primary font-medium leading-relaxed"
        >
          {parseInline(line)}
        </p>
      );
    } else if (line.trim() === "") {
      flushBullets();
    } else {
      flushBullets();
      elements.push(
        <p key={key++} className="text-text-secondary leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  }
  flushBullets();

  return <div className="space-y-3">{elements}</div>;
}

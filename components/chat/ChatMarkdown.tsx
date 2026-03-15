"use client"

import Markdown from "react-markdown"

export default function ChatMarkdown({
  content,
}: {
  readonly content: string
}) {
  return (
    <div className="chat-markdown space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <Markdown
        components={{
          p({ children }) {
            return (
              <p className="text-sm leading-relaxed text-text-primary first:mt-0 last:mb-0">
                {children}
              </p>
            )
          },
          strong({ children }) {
            return (
              <strong className="font-semibold text-text-primary">
                {children}
              </strong>
            )
          },
          em({ children }) {
            return <em className="italic text-text-secondary">{children}</em>
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-accent-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-inside space-y-1 text-sm text-text-primary">
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside space-y-1 text-sm text-text-primary">
                {children}
              </ol>
            )
          },
          li({ children }) {
            return (
              <li className="text-text-secondary leading-relaxed">
                {children}
              </li>
            )
          },
          code({ children, className, ...rest }) {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="font-mono text-xs bg-bg-hover px-1.5 py-0.5 rounded text-accent-primary"
                  {...rest}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="font-mono text-xs text-text-secondary block whitespace-pre-wrap break-words"
                {...rest}
              >
                {children}
              </code>
            )
          },
          pre({ children }) {
            return (
              <pre className="bg-bg-hover rounded-lg p-3 overflow-x-auto my-2">
                {children}
              </pre>
            )
          },
          h1({ children }) {
            return (
              <h1 className="text-sm font-semibold text-text-primary">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="text-sm font-medium text-text-primary">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {children}
              </h3>
            )
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-accent-primary/40 pl-3 text-text-secondary italic text-sm">
                {children}
              </blockquote>
            )
          },
          hr() {
            return <hr className="border-border-subtle my-2" />
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}

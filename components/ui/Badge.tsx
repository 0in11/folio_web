import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block font-mono text-xs text-text-secondary px-2 py-0.5 rounded bg-bg-surface border border-border-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}

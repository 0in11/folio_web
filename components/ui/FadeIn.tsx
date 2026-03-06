"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

/** Delay increment (seconds) for staggered fade-in sequences. */
export const STAGGER_DELAY = 0.08;

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}

export default function FadeIn({ children, delay = 0, className, as = "div" }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    if (as === "li") return <li className={className}>{children}</li>;
    return <div className={className}>{children}</div>;
  }

  const MotionComponent = as === "li" ? motion.li : motion.div;

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

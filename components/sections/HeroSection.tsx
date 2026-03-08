"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeOnly = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  const container = prefersReducedMotion ? {} : stagger;
  const item = prefersReducedMotion
    ? {}
    : { ...fadeUp, transition: { duration: 0.5, ease: "easeOut" } };
  const titleItem = prefersReducedMotion
    ? {}
    : { ...fadeOnly, transition: { duration: 0.5, ease: "easeOut" } };

  const Wrapper = prefersReducedMotion ? "div" : motion.div;
  const Item = prefersReducedMotion ? "div" : motion.div;

  return (
    <section
      className="min-h-screen flex flex-col justify-center px-6 pt-16"
      aria-labelledby="hero-heading"
    >
      <Wrapper
        className="max-w-content mx-auto w-full"
        {...(!prefersReducedMotion && { initial: "initial", animate: "animate", variants: container })}
      >
        {/* Eyebrow */}
        <Item {...(!prefersReducedMotion && { variants: item })}>
          <p className="font-mono text-sm text-accent-primary tracking-widest uppercase mb-6">
            AI Engineer
          </p>
        </Item>

        {/* Name */}
        <Item {...(!prefersReducedMotion && { variants: titleItem })}>
          <h1
            id="hero-heading"
            className="font-display font-bold tracking-tight mb-6"
          >
            <span className="block text-6xl md:text-8xl text-text-primary leading-[1.15] pb-[0.08em]">
              Jin YoungIn
            </span>
            <span className="block text-text-muted text-5xl md:text-7xl leading-[1.1] mt-2">
              진영인
            </span>
          </h1>
        </Item>

        {/* Role Description */}
        <Item {...(!prefersReducedMotion && { variants: item })}>
          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-4 leading-relaxed">
            Building production-ready{" "}
            <span className="text-accent-primary">RAG, agents</span>, and{" "}
            <span className="text-accent-primary">domain LLM systems</span>{" "}
            that solve real problems.
          </p>
        </Item>

        <Item {...(!prefersReducedMotion && { variants: item })}>
          <p className="text-base text-text-muted max-w-xl mb-12 leading-relaxed">
            도메인 지식을 실제 작동하는 AI 시스템으로 연결하는 엔지니어.
            LLMOps부터 온프레미스 서빙까지.
          </p>
        </Item>

        {/* CTAs */}
        <Item {...(!prefersReducedMotion && { variants: item })}>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#projects"
              className="inline-flex items-center gap-2 bg-accent-primary text-bg-primary px-6 py-3 rounded-card font-medium text-sm hover:bg-accent-primary/90 transition-colors"
            >
              Selected Projects
              <ArrowRight size={16} />
            </Link>
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 border border-border-strong text-text-primary px-6 py-3 rounded-card font-medium text-sm hover:bg-bg-surface transition-colors"
            >
              Resume
              <Download size={16} />
            </a>
          </div>
        </Item>
      </Wrapper>
    </section>
  );
}

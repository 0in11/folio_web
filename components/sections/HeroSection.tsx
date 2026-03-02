"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center px-6 pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-content mx-auto w-full">
        {/* Eyebrow */}
        <p className="font-mono text-sm text-accent-primary tracking-widest uppercase mb-6">
          AI Engineer
        </p>

        {/* Name */}
        <h1
          id="hero-heading"
          className="font-display text-6xl md:text-8xl font-bold text-text-primary leading-none tracking-tight mb-6"
        >
          Jin YoungIn
          <span className="block text-text-muted text-5xl md:text-7xl mt-2">
            진영인
          </span>
        </h1>

        {/* Role Description */}
        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-4 leading-relaxed">
          Building production-ready{" "}
          <span className="text-accent-primary">RAG, agents</span>, and{" "}
          <span className="text-accent-primary">domain LLM systems</span>{" "}
          that solve real problems.
        </p>

        <p className="text-base text-text-muted max-w-xl mb-12 leading-relaxed">
          도메인 지식을 실제 작동하는 AI 시스템으로 연결하는 엔지니어.
          LLMOps부터 온프레미스 서빙까지.
        </p>

        {/* CTAs */}
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
      </div>
    </section>
  );
}

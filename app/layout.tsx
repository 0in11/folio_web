import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700"],
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://youngin-jin.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Jin YoungIn | AI Engineer Portfolio",
  description:
    "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Jin YoungIn Portfolio",
    title: "Jin YoungIn | AI Engineer Portfolio",
    description:
      "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Jin YoungIn | AI Engineer Portfolio",
    description:
      "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${syne.variable} ${jakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg-primary text-text-primary antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-bg-surface focus:text-text-primary focus:rounded-card focus:border focus:border-border-strong"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}

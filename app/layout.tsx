import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import ChatBot from "@/components/chat/ChatBot";
import { SITE_URL } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
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


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
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
      className={`${spaceGrotesk.variable} ${jakartaSans.variable} ${jetbrainsMono.variable}`}
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
        <ChatBot />
      </body>
    </html>
  );
}

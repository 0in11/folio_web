import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jin YoungIn Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jin YoungIn | AI Engineer Portfolio",
    description:
      "AI Engineer focused on RAG, agents, LLMOps, and domain-specific AI systems.",
    images: ["/og-image.png"],
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
      className={jakartaSans.variable}
    >
      <body className="bg-bg-primary text-text-primary antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

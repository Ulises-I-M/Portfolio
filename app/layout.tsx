import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/context/LangContext";
import GrainOverlay from "@/components/ui/GrainOverlay";
import CRTOverlay from "@/components/ui/CRTOverlay";
import ScrollProgress from "@/components/ui/ScrollProgress";
import BackToTop from "@/components/ui/BackToTop";
import CustomCursor from "@/components/ui/CustomCursor";
import BootWrapper from "@/components/ui/BootWrapper";
import Terminal from "@/components/ui/Terminal";
import DataTicker from "@/components/ui/DataTicker";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Ulises Miranda — Frontend Developer",
  description:
    "Portfolio de Ulises Miranda, Frontend Developer especializado en React, Next.js y TypeScript. Buenos Aires, Argentina.",
  keywords: ["frontend developer", "react", "nextjs", "typescript", "portfolio", "argentina"],
  authors: [{ name: "Ulises Miranda" }],
  openGraph: {
    title: "Ulises Miranda — Frontend Developer",
    description:
      "Portfolio de Ulises Miranda, Frontend Developer especializado en React, Next.js y TypeScript. Buenos Aires, Argentina.",
    type: "website",
    locale: "es_AR",
    siteName: "Ulises Miranda Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ulises Miranda — Frontend Developer",
    description: "Portfolio de Ulises Miranda, Frontend Developer especializado en React, Next.js y TypeScript.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Mark returning visitors before React hydrates — eliminates boot flash.
            Raw <script> in <head> executes synchronously before <body> parses,
            which is the correct App Router pattern (next/script beforeInteractive
            is Pages Router only and triggers a React 18 warning in App Router). */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('booted'))document.documentElement.dataset.booted='1'}catch(e){}`,
          }}
        />
      </head>
      <body
        className="min-h-full bg-[#0a0a0a] text-[#efefef] antialiased"
        style={{ fontFamily: "'Space Mono', ui-monospace, monospace" }}
      >
        <LangProvider>
          {/* Global overlays — always present, outside boot gate */}
          <GrainOverlay />
          <CRTOverlay />
          <ScrollProgress />
          <CustomCursor />
          {/* Everything below only renders after the boot sequence completes */}
          <BootWrapper>
            <Navbar />
            {children}
            <BackToTop />
            <DataTicker />
            <Terminal />
          </BootWrapper>
        </LangProvider>
      </body>
    </html>
  );
}

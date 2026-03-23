import type { Metadata } from "next";
import "./globals.css";
import GrainOverlay from "@/components/ui/GrainOverlay";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Ulises Miranda — Frontend Developer",
  description:
    "Portfolio de Ulises Miranda, Frontend Developer especializado en React, Next.js y TypeScript. Buenos Aires, Argentina.",
  keywords: ["frontend developer", "react", "nextjs", "typescript", "portfolio", "argentina"],
  authors: [{ name: "Ulises Miranda" }],
  openGraph: {
    title: "Ulises Miranda — Frontend Developer",
    description: "Portfolio de Ulises Miranda, Frontend Developer.",
    type: "website",
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
      </head>
      <body className="min-h-full bg-[#0a0a0a] text-[#efefef] antialiased" style={{ fontFamily: "'Space Mono', ui-monospace, monospace" }}>
        <GrainOverlay />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

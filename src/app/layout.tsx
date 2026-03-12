import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://davidreko.github.io"),
  title: "David Reko | Software Engineer",
  description:
    "Software engineer specializing in production-grade agentic LLM systems and AI-powered developer tooling.",
  openGraph: {
    title: "David Reko | Software Engineer",
    description:
      "Ski the mountain to explore my portfolio. Software engineer specializing in generative AI and developer tooling.",
    type: "website",
    siteName: "David Reko",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

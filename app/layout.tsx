import type { Metadata } from "next";
import { Fraunces, Karla, Spline_Sans_Mono } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});
const sans = Karla({ subsets: ["latin"], variable: "--font-sans" });
const mono = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Seedsy — get cited by Google and AI search, on autopilot",
  description:
    "Seedsy analyzes your business, plans and publishes SEO + GEO content daily, exchanges contextual backlinks, and tracks how often ChatGPT, Claude, Gemini and Perplexity recommend you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain font-sans min-h-screen">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

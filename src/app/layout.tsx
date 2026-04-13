import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gaiaproject-search.vercel.app'),
  title: "Gaia Project Search — BGA Game Database",
  description: "Search and analyze thousands of Gaia Project games from Board Game Arena. Filter by race, buildings built, research track levels, ELO, and more.",
  keywords: ["Gaia Project", "Board Game Arena", "BGA", "strategy game", "game search", "game database"],
  openGraph: {
    title: "Gaia Project Search",
    description: "Search and analyze BGA Gaia Project games by race, buildings, research tracks, and ELO.",
    url: 'https://gaiaproject-search.vercel.app',
    siteName: "Gaia Project Search",
    type: "website",
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
        <Analytics />
      </body>
    </html>
  );
}

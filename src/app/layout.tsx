import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Provider } from "@/components/ui/provider";

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
  title: "Team randomizer",
  description: "To randomly create teams from a list of members.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Antigravity — Creator Discovery & UGC Content Network",
  description:
    "Discover talented UGC creators through their content. Watch, explore, and hire creative talent for your brand. A social-first platform where content drives discovery.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Antigravity — Creator Discovery & UGC Content Network",
    description:
      "Watch authentic UGC content. Discover and hire talented short-form video creators for your brand.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-white overscroll-none">
        {children}
      </body>
    </html>
  );
}

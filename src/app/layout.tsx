import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Creator — Social Commerce Platform for Creators & Brands",
  description:
    "Creator is a unified social commerce platform where content is the entry point, creators are the supply, businesses bring products and opportunities, and commerce happens naturally.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Creator",
  },
  icons: {
    icon: "/creator-icon.svg",
    apple: "/creator-icon.svg",
  },
  openGraph: {
    title: "Creator — Social Commerce Platform for Creators & Brands",
    description:
      "Watch reels, book authentic UGC creators, and shop Nigerian brand products with creator affiliate commissions.",
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
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}


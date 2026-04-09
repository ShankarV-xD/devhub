import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { PostHogPageView } from "@/components/PostHogPageView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevHub - Developer Tools & Utilities",
  description:
    "Smart developer tools hub with auto-detection. Format JSON, decode JWT, validate regex, test SQL, convert colors, and more - all in one place.",
  keywords: [
    "developer tools",
    "json formatter",
    "jwt decoder",
    "base64",
    "regex tester",
    "sql formatter",
    "devtools",
  ],
  authors: [{ name: "Shankar" }],
  openGraph: {
    title: "DevHub - Developer Tools & Utilities",
    description:
      "Smart developer tools hub with auto-detection. Format, decode, validate, and transform your code instantly. Supports JSON, JWT, Base64, Regex, SQL, Colors, HTML, Markdown, YAML, Cron, and more.",
    type: "website",
    siteName: "DevHub",
    locale: "en_US",
    url: "https://devhub.com",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "DevHub - Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevHub - Developer Tools & Utilities",
    description:
      "Smart developer tools hub with auto-detection. Format, decode, validate, and transform your code instantly.",
    creator: "@x_usernametaken",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "512x512", type: "image/png" }],
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          Skip to main content
        </a>
        <Suspense>
          <PostHogPageView />
        </Suspense>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}

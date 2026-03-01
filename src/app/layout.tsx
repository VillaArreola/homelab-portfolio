import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/layout/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Homelab Portfolio",
  description: "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
  icons: {
    icon: "/MVA.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://homelab.villaarreola.com",
    siteName: "My Homelab Portfolio",
    title: "My Homelab Portfolio - Interactive Infrastructure Diagram",
    description: "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
    images: [
      {
        url: "/MVA.svg",
        width: 512,
        height: 512,
        alt: "My Homelab Portfolio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Homelab Portfolio",
    description: "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
    images: ["/MVA.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <CookieBanner />
      </body>
    </html>
  );
}

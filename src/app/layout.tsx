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
  metadataBase: new URL("https://lab.villaarreola.com"),
  title: "Homelab Portfolio | Martin Villa Arreola",
  description: "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lab.villaarreola.com",
    siteName: "Homelab Portfolio | Martin Villa Arreola",
    title: "Homelab Portfolio | Martin Villa Arreola",
    description: "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
    images: [
      {
        url: "/diagram1200-630.png",
        width: 1200,
        height: 630,
        alt: "Homelab Infrastructure Diagram",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homelab Portfolio | Martin Villa Arreola",
    description: "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
    images: ["/diagram1200-630.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://lab.villaarreola.com/#person",
                  "name": "Martin Villa Arreola",
                  "url": "https://www.villaarreola.com",
                  "sameAs": [
                    "https://linkedin.com/in/villaarreola",
                    "https://github.com/villaarreola"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://lab.villaarreola.com/#website",
                  "url": "https://lab.villaarreola.com",
                  "name": "Homelab Portfolio – Martin Villa Arreola",
                  "description": "Interactive homelab infrastructure diagram with real-time monitoring and AI-powered topology generation",
                  "author": { "@id": "https://lab.villaarreola.com/#person" }
                }
              ]
            })
          }}
        />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

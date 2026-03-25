import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://partyspace.tamashani.com'),
  title: {
    default: 'Party Space - Interactive Party Games & Awards Ceremonies',
    template: '%s | Party Space'
  },
  description: 'Create unforgettable moments with Party Space. Host BET Awards ceremonies, play interactive party games with friends, family, or coworkers. No downloads required - works on any device!',
  keywords: [
    'party games',
    'BET awards',
    'online party games',
    'virtual awards ceremony',
    'interactive voting',
    'group games',
    'office party games',
    'school awards',
    'superlatives',
    'graduation awards',
    'team building games',
    'online voting',
    'party activities',
    'celebration games',
    'award ceremony maker'
  ],
  authors: [{ name: 'Party Space' }],
  creator: 'Party Space',
  publisher: 'Party Space',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://partyspace.tamashani.com',
    title: 'Party Space - Interactive Party Games & Awards Ceremonies',
    description: 'Host BET Awards ceremonies and interactive party games. Perfect for schools, offices, and celebrations. No downloads required!',
    siteName: 'Party Space',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Party Space - Where every gathering becomes unforgettable',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Party Space - Interactive Party Games & Awards Ceremonies',
    description: 'Host BET Awards ceremonies and interactive party games. Perfect for schools, offices, and celebrations. No downloads required!',
    images: ['/og-image.png'],
    creator: '@partyspace',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://partyspace.tamashani.com',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'entertainment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#FF6B6B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Party Space" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Flavors&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

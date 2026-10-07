import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const fontHeading = Manrope({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
});

const fontSans = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hesapera.com.tr"),
  title: "Hesapera | Modern Hesaplama Platformu",
  description: "Türkiye'nin en gelişmiş, ücretsiz ve modern hesaplama platformu.",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-192x192.png',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Hesapera",
    url: "https://www.hesapera.com.tr/",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "google-adsense-account": "ca-pub-6226482996926045",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${fontSans.variable} ${fontHeading.variable} h-full antialiased`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6226482996926045"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <GoogleAnalytics />
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

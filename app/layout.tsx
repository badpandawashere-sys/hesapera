import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
  title: "Hesapera | Modern Hesaplama Platformu",
  description: "TÃ¼rkiye'nin en geliÅŸmiÅŸ, Ã¼cretsiz ve modern hesaplama platformu.",
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
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <Header />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

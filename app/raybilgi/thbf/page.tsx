import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, TrainFront } from 'lucide-react';
import { SiteContainer } from '@/components/layout/site-container';
import { ThbfParser } from '@/components/raybilgi/thbf-parser';

const CANONICAL = 'https://www.hesapera.com.tr/raybilgi/thbf';

export const metadata: Metadata = {
  title: 'THBF Çözümleyici – RayBilgi | Hesapera',
  description:
    'THBF PDF dosyalarını tarayıcıda çözümleyin, vagonları seçin ve saha vaziyetine uygun biçimde kopyalayın.',
  alternates: { canonical: CANONICAL },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Hesapera', item: 'https://www.hesapera.com.tr' },
    { '@type': 'ListItem', position: 2, name: 'RayBilgi', item: 'https://www.hesapera.com.tr/raybilgi' },
    { '@type': 'ListItem', position: 3, name: 'THBF Çözümleyici', item: CANONICAL },
  ],
};

export default function ThbfPage() {
  return (
    <main className="flex-1 py-10 bg-muted/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteContainer>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-foreground">Hesapera</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
            <li>
              <Link href="/raybilgi" className="hover:text-foreground">RayBilgi</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
            <li aria-current="page" className="text-foreground font-medium">THBF Çözümleyici</li>
          </ol>
        </nav>

        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
              <TrainFront className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              THBF Çözümleyici
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            THBF PDF dosyanızı tarayıcınızda çözümleyin, vagonları seçin ve saha vaziyetine uygun formatta kopyalayın.
          </p>
        </div>

        <ThbfParser />
      </SiteContainer>
    </main>
  );
}

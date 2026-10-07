import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import { CekerBilgi } from '@/components/raybilgi/ceker-bilgi';
import { Train } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Çeker Bilgi – Lokomotif Kanca Çekeri | RayBilgi | Hesapera',
  description: 'Başlangıç ve varış istasyonunu seçerek güzergâhtaki tüm lokomotifler için azami kanca çekeri bilgilerini karşılaştırın.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/raybilgi/ceker-bilgi',
  },
};

export default function CekerBilgiPage() {
  return (
    <main className="flex-1 py-12 bg-muted/10 min-h-[calc(100vh-var(--header-height))]">
      <SiteContainer>
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">Hesapera</Link>
          <span>›</span>
          <Link href="/raybilgi" className="hover:text-foreground transition-colors">RayBilgi</Link>
          <span>›</span>
          <span className="text-foreground">Çeker Bilgi</span>
        </nav>

        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
              <Train className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Çeker Bilgi
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            Başlangıç ve varış istasyonunu seçerek güzergâhtaki tüm lokomotifler için azami kanca çekeri bilgilerini karşılaştırın.
          </p>
        </div>

        {/* App Container */}
        <CekerBilgi />
      </SiteContainer>
    </main>
  );
}

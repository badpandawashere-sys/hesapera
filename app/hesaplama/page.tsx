import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import { mockCalculators } from '@/lib/data/calculators';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tüm Hesaplama Araçları | Hesapera',
  description: 'İhtiyacınız olan tüm hesaplama araçlarını Hesapera ile kolayca bulun.',
};

export default function HesaplamaIndexPage() {
  return (
    <main className="flex-1 py-12 bg-muted/10">
      <SiteContainer>
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Hesaplayıcılar
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            İhtiyacınıza uygun hesaplama aracını aşağıdan seçebilirsiniz.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCalculators.map((item) => (
            <Link key={item.id} href={item.href} className="group p-5 rounded-2xl bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] hover:shadow-[var(--shadow-glass-standard)] hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-sm text-label-sm text-[#7C3AED] uppercase font-bold tracking-wider">{item.category}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-slate-900 text-[17px] leading-snug mb-2 group-hover:text-[#7C3AED] transition-colors">
                  {item.title}
                </h3>
                <p className="font-body-sm text-body-sm text-slate-500 line-clamp-2">
                  {item.desc}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 font-label-md text-label-md text-[#2563EB] font-semibold mt-4">
                <span>Hesapla</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </SiteContainer>
    </main>
  );
}

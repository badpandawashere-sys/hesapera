import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init'; // populate registry
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/data/categories';

export const metadata: Metadata = {
  title: 'Tüm Hesaplama Araçları | Hesapera',
  description: 'İhtiyacınız olan tüm hesaplama araçlarını Hesapera ile kolayca bulun.',
};

export default function HesaplamaIndexPage() {
  const publishedCalculators = CalculatorRegistry.getPublishedAll();

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
          {publishedCalculators.map((item) => {
            const uiCategoryId = CalculatorRegistry.getUiCategory(item.slug, item.category);
            const uiCategoryName = categories.find(c => c.id === uiCategoryId)?.name || uiCategoryId;

            return (
              <Link key={item.id} href={`/hesaplama/${item.slug}`} className="group p-5 rounded-2xl bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] hover:shadow-[var(--shadow-glass-standard)] hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-label-sm text-label-sm text-[#7C3AED] uppercase font-bold tracking-wider">{uiCategoryName}</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4">
                    {item.shortDescription}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold mt-2">
                  <span>Hesapla</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </SiteContainer>
    </main>
  );
}

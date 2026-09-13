import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import { categories } from '@/lib/data/categories';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kategoriler | Hesapera',
  description: 'Tüm hesaplama kategorilerimizi inceleyin.',
  alternates: {
    canonical: 'https://www.hesapera.com.tr/kategoriler',
  },
};

export default function KategorilerIndexPage() {
  const activeCategories = categories.map(cat => {
    const publishedCount = CalculatorRegistry.getPublishedByCategory(cat.id).length;
    return {
      ...cat,
      publishedCount,
      dynamicCountText: `${publishedCount} Araç`
    };
  }).filter(cat => cat.publishedCount > 0);

  return (
    <main className="flex-1 py-12 bg-muted/10">
      <SiteContainer>
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Kategoriler
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Aşağıdaki kategorilerden hesaplama araçlarına erişebilirsiniz.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {activeCategories.map((cat) => (
            <Link key={cat.id} href={`/kategoriler/${cat.id}`} className="group flex flex-col p-6 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all shadow-sm border border-border/50">
              <div className={`w-12 h-12 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface text-[16px] leading-tight mb-2">{cat.name}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{cat.dynamicCountText}</span>
            </Link>
          ))}
        </div>
      </SiteContainer>
    </main>
  );
}

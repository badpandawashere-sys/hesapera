import { Metadata } from 'next';
import { SiteContainer } from '@/components/layout/site-container';
import { categories } from '@/lib/data/categories';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

const title = 'Hesaplama Rehberleri | Hesapera';
const description = 'Hesapera üzerinde bulunan tüm hesaplama araçlarının detaylı çalışma mantıklarını, formüllerini ve sonuçların nasıl yorumlanacağını anlatan rehber merkezimiz.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://www.hesapera.com.tr/rehber',
  },
  openGraph: {
    title,
    description,
    url: 'https://www.hesapera.com.tr/rehber',
  },
  twitter: {
    title,
    description,
  },
};

export default function RehberIndexPage() {
  const activeCategories = categories.map(cat => {
    const publishedCalculators = CalculatorRegistry.getPublishedByCategory(cat.id);
    return {
      ...cat,
      calculators: publishedCalculators
    };
  }).filter(cat => cat.calculators.length > 0);

  return (
    <main className="flex-1 py-12 bg-muted/10">
      <SiteContainer>
        <div className="mb-12 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Hesaplama Rehberleri
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Hesaplamaların yalnızca sonucunu değil, arka planda nasıl çalıştığını ve çıkan sonuçları nasıl yorumlamanız gerektiğini anlatan detaylı rehberlerimizi inceleyin.
          </p>
        </div>

        <div className="space-y-16">
          {activeCategories.map((cat) => (
            <section key={cat.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{cat.name} Rehberleri</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.calculators.map((calc) => (
                  <Link 
                    key={calc.id} 
                    href={`/hesaplama/${calc.slug}`}
                    className="group flex flex-col p-6 rounded-xl bg-surface-container-low hover:bg-surface-container-high hover:shadow-md transition-all border border-border/50 h-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                          {calc.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                      {calc.metadata.content?.intro || calc.shortDescription}
                    </p>
                    
                    <div className="flex items-center text-primary text-sm font-medium mt-auto">
                      Rehberi Oku
                      <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </SiteContainer>
    </main>
  );
}

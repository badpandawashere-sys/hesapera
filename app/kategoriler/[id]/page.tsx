import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteContainer } from '@/components/layout/site-container';
import { categories } from '@/lib/data/categories';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init'; // populate registry
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const category = categories.find(c => c.id === id);
  if (!category) return { title: 'Kategori Bulunamadı' };
  
  const title = `${category.name} Hesaplamaları | Hesapera`;
  const canonical = `https://www.hesapera.com.tr/kategoriler/${category.id}`;
  const description = `${category.name} kategorisindeki hesaplama araçları.`;
  
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { id } = await props.params;
  const category = categories.find(c => c.id === id);
  
  if (!category) {
    notFound();
  }

  const publishedCalculators = CalculatorRegistry.getPublishedByCategory(id);

  if (publishedCalculators.length === 0) {
    // İçinde published araç bulunmayan kategoriler görünmemeli ve erişilmemeli
    notFound();
  }

  return (
    <main className="flex-1 py-12 bg-muted/10">
      <SiteContainer>
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {category.name} Araçları
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Bu kategorideki tüm hesaplama araçları.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {publishedCalculators.map((item) => (
            <div key={item.id} className="p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-border/50">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-6">
                  {item.shortDescription}
                </p>
              </div>
              <Link className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold mt-4" href={`/hesaplama/${item.slug}`}>
                <span>Hesapla</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </SiteContainer>
    </main>
  );
}

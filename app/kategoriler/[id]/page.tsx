import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteContainer } from '@/components/layout/site-container';
import { mockCalculators } from '@/lib/data/calculators';
import { categories } from '@/lib/data/categories';
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
  
  return {
    title: `${category.name} Hesaplamaları | Hesapera`,
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { id } = await props.params;
  const category = categories.find(c => c.id === id);
  
  if (!category) {
    notFound();
  }

  // Filter based on the 'category' name string from categories.ts
  const filteredCalculators = mockCalculators.filter(c => c.category === category.name);

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
        
        {filteredCalculators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCalculators.map((item) => (
              <div key={item.id} className="p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-border/50">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-6">
                    {item.desc}
                  </p>
                </div>
                <Link className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold mt-4" href={item.href}>
                  <span>Hesapla</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Bu kategoride henüz araç bulunmuyor.</p>
        )}
      </SiteContainer>
    </main>
  );
}

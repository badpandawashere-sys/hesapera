import Link from 'next/link';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { CalculatorCategory, CalculatorDefinition } from '@/calculators/core/calculator-types';
import * as LucideIcons from 'lucide-react';

interface RelatedCalculatorsProps {
  category: CalculatorCategory;
  currentSlug: string;
}

const SEMANTIC_RELATIONS: Record<string, string[]> = {
  'kredi': ['ihtiyac-kredisi', 'konut-kredisi', 'tasit-kredisi', 'ne-kadar-kredi-alabilirim'],
  'ihtiyac-kredisi': ['kredi', 'ne-kadar-kredi-alabilirim', 'kredi-yapilandirma', 'kredi-yillik-maliyet-orani'],
  'konut-kredisi': ['kredi', 'ne-kadar-kredi-alabilirim', 'ihtiyac-kredisi'],
  'tasit-kredisi': ['kredi', 'ihtiyac-kredisi', 'ne-kadar-kredi-alabilirim'],
  'kredi-yapilandirma': ['kredi', 'ihtiyac-kredisi', 'kredi-yillik-maliyet-orani'],
  'kredi-yillik-maliyet-orani': ['kredi', 'ihtiyac-kredisi', 'kredi-yapilandirma'],
  'ne-kadar-kredi-alabilirim': ['kredi', 'ihtiyac-kredisi', 'konut-kredisi', 'tasit-kredisi'],
  'kredi-karti-asgari-odeme-tutari': ['kredi-karti-gecikme-faizi', 'ihtiyac-kredisi'],
  'kredi-karti-gecikme-faizi': ['kredi-karti-asgari-odeme-tutari', 'ihtiyac-kredisi'],

  'yuzde': ['oran', 'basit-faiz', 'bilesik-buyume'],
  'oran': ['yuzde', 'ebob-ekok'],
  'metrekare': ['alan', 'cevre', 'hacim'],
  'alan': ['metrekare', 'cevre', 'hacim'],
  'cevre': ['alan', 'metrekare', 'hacim'],
  'hacim': ['alan', 'metrekare', 'cevre'],
  'ebob-ekok': ['faktoriyel', 'koklu-sayi'],
  'koklu-sayi': ['ebob-ekok', 'faktoriyel'],
  'faktoriyel': ['ebob-ekok', 'koklu-sayi'],

  'altin': ['gecmis-altin-fiyatlari', 'doviz', 'birikim'],
  'gecmis-altin-fiyatlari': ['altin', 'gecmis-doviz-kurlari', 'enflasyon'],
  'doviz': ['gecmis-doviz-kurlari', 'altin', 'birikim'],
  'gecmis-doviz-kurlari': ['doviz', 'gecmis-altin-fiyatlari', 'enflasyon'],
  'enflasyon': ['kira-artis-orani', 'gecmis-doviz-kurlari', 'gecmis-altin-fiyatlari'],
  'vadeli-mevduat-faizi': ['birikim', 'faiz', 'basit-faiz', 'bilesik-buyume'],
  'faiz': ['vadeli-mevduat-faizi', 'basit-faiz', 'bilesik-buyume', 'birikim'],
  'birikim': ['vadeli-mevduat-faizi', 'bilesik-buyume', 'altin', 'doviz'],
  'bilesik-buyume': ['faiz', 'vadeli-mevduat-faizi', 'birikim', 'yuzde'],
  'basit-faiz': ['faiz', 'vadeli-mevduat-faizi', 'bilesik-buyume', 'yuzde'],

  'vucut-kitle-endeksi': ['ideal-kilo', 'gunluk-kalori-ihtiyaci', 'yas'],
  'ideal-kilo': ['vucut-kitle-endeksi', 'gunluk-kalori-ihtiyaci', 'yas'],
  'gunluk-kalori-ihtiyaci': ['vucut-kitle-endeksi', 'ideal-kilo', 'yas'],
  'yas': ['vucut-kitle-endeksi', 'ideal-kilo', 'gunluk-kalori-ihtiyaci'],

  'tyt-puan': ['yks-puan', 'ders-notu', 'takdir-tesekkur'],
  'yks-puan': ['tyt-puan', 'ders-notu', 'takdir-tesekkur'],
  'lgs-puan': ['ders-notu', 'takdir-tesekkur'],
  'ders-notu': ['takdir-tesekkur', 'tyt-puan', 'lgs-puan'],
  'takdir-tesekkur': ['ders-notu', 'tyt-puan', 'lgs-puan'],
  'kpss-puan': ['ders-notu', 'takdir-tesekkur'],

  'kira-artis-orani': ['enflasyon', 'konut-kredisi'],
  'yakit-maliyeti': ['tasit-kredisi', 'yuzde', 'oran'],
};

export function RelatedCalculators({ category, currentSlug }: RelatedCalculatorsProps) {
  const semanticSlugs = SEMANTIC_RELATIONS[currentSlug] || [];
  
  const semanticCalculators: CalculatorDefinition<any, any>[] = [];
  
  for (const slug of semanticSlugs) {
    const calc = CalculatorRegistry.getBySlug(slug);
    if (calc && calc.status === 'published' && calc.slug !== currentSlug) {
      semanticCalculators.push(calc);
    }
  }

  const uiCategory = CalculatorRegistry.getUiCategory(currentSlug, category);
  const fallbackCalculators = CalculatorRegistry.getPublishedByCategory(uiCategory)
    .filter(calc => calc.slug !== currentSlug);

  const combined = [...semanticCalculators, ...fallbackCalculators];
  
  const uniqueRelated = Array.from(
    new Map(combined.map(item => [item.slug, item])).values()
  );
  
  const finalRelated = uniqueRelated.slice(0, 4);

  if (finalRelated.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 max-w-7xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6 text-[#0F172A]">
        İlgili Hesaplamalar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {finalRelated.map((calc) => {
          const iconName = calc.metadata?.icon;
          const Icon = iconName ? (LucideIcons as any)[iconName] || LucideIcons.Calculator : LucideIcons.Calculator;
          
          return (
            <Link 
              key={calc.slug}
              href={`/hesaplama/${calc.slug}`}
              className="group flex flex-col p-5 md:p-6 bg-white border border-slate-200 rounded-[20px] shadow-sm hover:shadow-md hover:border-[#7C3AED]/30 transition-all duration-200"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-[#F5F3FF] flex items-center justify-center shrink-0 mb-4 group-hover:bg-[#EDE9FE] transition-colors">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#7C3AED]" />
              </div>
              <h3 className="text-[16px] md:text-[17px] font-semibold text-[#1E293B] mb-2 leading-snug group-hover:text-[#7C3AED] transition-colors">
                {calc.name}
              </h3>
              <p className="text-[14px] text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                {calc.shortDescription}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

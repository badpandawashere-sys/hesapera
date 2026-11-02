import Link from 'next/link';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { CalculatorCategory, CalculatorDefinition } from '@/calculators/core/calculator-types';
import * as LucideIcons from 'lucide-react';

interface RelatedCalculatorsProps {
  category: CalculatorCategory;
  currentSlug: string;
}

export const SEMANTIC_RELATIONS: Record<string, string[]> = {
  // --- Krediler ---
  'kredi': ['ihtiyac-kredisi', 'konut-kredisi', 'tasit-kredisi', 'ne-kadar-kredi-alabilirim'],
  'ihtiyac-kredisi': ['kredi', 'konut-kredisi', 'tasit-kredisi', 'ne-kadar-kredi-alabilirim'],
  'konut-kredisi': ['kredi', 'ihtiyac-kredisi', 'kredi-erken-kapatma-cezasi', 'ne-kadar-kredi-alabilirim'],
  'tasit-kredisi': ['kredi', 'ihtiyac-kredisi', 'yakit-tuketimi', 'mtv-hesaplama'],
  'is-yeri-kredisi': ['kredi', 'konut-kredisi', 'ihtiyac-kredisi', 'kredi-yillik-maliyet-orani'],
  'kredi-erken-kapatma-cezasi': ['konut-kredisi', 'ihtiyac-kredisi', 'kredi', 'kredi-yapilandirma'],
  'kredi-dosya-masrafi': ['kredi', 'ihtiyac-kredisi', 'konut-kredisi', 'kredi-yillik-maliyet-orani'],
  'kredi-yapilandirma': ['kredi', 'ihtiyac-kredisi', 'kredi-erken-kapatma-cezasi', 'kredi-yillik-maliyet-orani'],
  'kredi-yillik-maliyet-orani': ['kredi', 'ihtiyac-kredisi', 'konut-kredisi', 'kredi-dosya-masrafi'],
  'ne-kadar-kredi-alabilirim': ['kredi', 'ihtiyac-kredisi', 'konut-kredisi', 'tasit-kredisi'],

  // --- Kredi Kartı ---
  'kredi-karti-asgari-odeme-tutari': ['kredi-karti-gecikme-faizi', 'ihtiyac-kredisi'],
  'kredi-karti-gecikme-faizi': ['kredi-karti-asgari-odeme-tutari', 'ihtiyac-kredisi'],

  // --- Mevduat & Faiz ---
  'vadeli-mevduat-faizi': ['faiz', 'basit-faiz', 'birikim', 'bilesik-buyume'],
  'faiz': ['vadeli-mevduat-faizi', 'basit-faiz', 'bilesik-buyume', 'birikim'],
  'basit-faiz': ['faiz', 'vadeli-mevduat-faizi', 'bilesik-buyume'],
  'bilesik-buyume': ['birikim', 'faiz', 'vadeli-mevduat-faizi', 'basit-faiz'],
  'birikim': ['bilesik-buyume', 'vadeli-mevduat-faizi', 'altin', 'doviz'],

  // --- Altın, Döviz, Enflasyon, Kira ---
  'altin': ['gecmis-altin-fiyatlari', 'doviz', 'birikim'],
  'gecmis-altin-fiyatlari': ['altin', 'gecmis-doviz-kurlari', 'doviz'],
  'doviz': ['gecmis-doviz-kurlari', 'altin', 'birikim'],
  'gecmis-doviz-kurlari': ['doviz', 'gecmis-altin-fiyatlari', 'enflasyon'],
  'enflasyon': ['kira-artis-orani', 'zam-hesaplama', 'gecmis-altin-fiyatlari', 'gecmis-doviz-kurlari'],
  'kira-artis-orani': ['enflasyon', 'konut-kredisi', 'zam-hesaplama'],

  // --- Ticari & Vergi ---
  'kdv-hesaplama': ['indirim-hesaplama', 'kar-marji-hesaplama', 'komisyon-hesaplama', 'yuzde'],
  'indirim-hesaplama': ['kdv-hesaplama', 'kar-marji-hesaplama', 'yuzde'],
  'kar-marji-hesaplama': ['komisyon-hesaplama', 'kdv-hesaplama', 'indirim-hesaplama', 'yuzde'],
  'komisyon-hesaplama': ['kar-marji-hesaplama', 'kdv-hesaplama', 'indirim-hesaplama', 'yuzde'],
  'zam-hesaplama': ['maas', 'enflasyon', 'kira-artis-orani', 'yuzde'],

  // --- Maaş & Kıdem ---
  'maas': ['kidem-tazminati', 'zam-hesaplama'],
  'kidem-tazminati': ['maas', 'zam-hesaplama'],

  // --- Bağımsız Bankacılık ---
  'iban-dogrulama': [],

  // --- Araç / Taşıt ---
  'yakit-tuketimi': ['yakit-maliyeti', 'tasit-kredisi', 'lastik-ebat-hesaplama', 'mtv-hesaplama'],
  'yakit-maliyeti': ['yakit-tuketimi', 'tasit-kredisi', 'lastik-ebat-hesaplama', 'mtv-hesaplama'],
  'mtv-hesaplama': ['tasit-kredisi', 'yakit-tuketimi', 'yakit-maliyeti'],
  'lastik-ebat-hesaplama': ['yakit-tuketimi', 'yakit-maliyeti'],

  // --- Sağlık ---
  'vucut-kitle-endeksi': ['ideal-kilo', 'gunluk-kalori-ihtiyaci'],
  'ideal-kilo': ['vucut-kitle-endeksi', 'gunluk-kalori-ihtiyaci'],
  'gunluk-kalori-ihtiyaci': ['vucut-kitle-endeksi', 'ideal-kilo'],

  // --- Geometri & Alan ---
  'alan': ['cevre', 'hacim', 'metrekare'],
  'cevre': ['alan', 'hacim', 'metrekare'],
  'hacim': ['alan', 'cevre', 'metrekare'],
  'metrekare': ['alan', 'cevre', 'hacim'],

  // --- Temel Matematik ---
  'yuzde': ['oran', 'basit-faiz', 'bilesik-buyume'],
  'oran': ['yuzde'],
  'ebob-ekok': [],
  'koklu-sayi': [],
  'faktoriyel': [],

  // --- Tarih & Yaş ---
  'gun-hesaplama': ['yas'],
  'yas': ['gun-hesaplama'],

  // --- Eğitim (Okul) ---
  'ders-notu': ['takdir-tesekkur'],
  'takdir-tesekkur': ['ders-notu', 'lgs-puan'],
  'lgs-puan': ['takdir-tesekkur', 'ders-notu'],

  // --- Eğitim (Üniversite & Askeri) ---
  'tyt-puan': ['yks-puan', 'msu-puan'],
  'yks-puan': ['tyt-puan', 'msu-puan'],
  'msu-puan': ['tyt-puan', 'yks-puan'],

  // --- Eğitim (Kamu / Memuriyet) ---
  'kpss-puan': ['ekpss-puan'],
  'ekpss-puan': ['kpss-puan'],

  // --- Eğitim (Hukuk & Yargı) ---
  'hmgs-puan': ['iyos-puan', 'h-kim-ve-savci-yardimciligi-sinavi-puan'],
  'iyos-puan': ['hmgs-puan', 'h-kim-ve-savci-yardimciligi-sinavi-puan'],
  'h-kim-ve-savci-yardimciligi-sinavi-puan': ['hmgs-puan', 'iyos-puan'],

  // --- Eğitim (Müstakil Mesleki / Uzmanlık) ---
  'isg-puan': [],
  'eus-puan': []
};

export function RelatedCalculators({ category, currentSlug }: RelatedCalculatorsProps) {
  const currentCalc = CalculatorRegistry.getBySlug(currentSlug);
  
  // Eğer tanımda veya SEMANTIC_RELATIONS'ta açıkça boş liste tanımlanmışsa (bağımsız araçlar), fallback ekleme ve bileşeni gizle
  const declaredRelated = currentCalc?.metadata?.relatedCalculators;
  if (Array.isArray(declaredRelated) && declaredRelated.length === 0) {
    return null;
  }
  if (SEMANTIC_RELATIONS[currentSlug] !== undefined && SEMANTIC_RELATIONS[currentSlug].length === 0) {
    return null;
  }

  const semanticSlugs = declaredRelated && declaredRelated.length > 0
    ? declaredRelated
    : (SEMANTIC_RELATIONS[currentSlug] || []);
  
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

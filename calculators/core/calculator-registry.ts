import { CalculatorDefinition } from './calculator-types';

const CATEGORY_MAP: Record<string, string> = {
  'yuzde': 'matematik',
  'oran': 'matematik',
  'metrekare': 'matematik',
  'hacim': 'matematik',
  'faktoriyel': 'matematik',
  'ebob-ekok': 'matematik',
  'koklu-sayi': 'matematik',
  'alan': 'matematik',
  'cevre': 'matematik',

  'ihtiyac-kredisi': 'kredi',
  'konut-kredisi': 'kredi',
  'kredi': 'kredi',
  'tasit-kredisi': 'kredi',
  'kredi-karti-asgari-odeme-tutari': 'kredi',
  'kredi-yapilandirma': 'kredi',
  'kredi-yillik-maliyet-orani': 'kredi',
  'ne-kadar-kredi-alabilirim': 'kredi',
  'kredi-karti-gecikme-faizi': 'kredi',

  'altin': 'finans',
  'doviz': 'finans',
  'enflasyon': 'finans',
  'faiz': 'finans',
  'vadeli-mevduat-faizi': 'finans',
  'birikim': 'finans',
  'bilesik-buyume': 'finans',
  'basit-faiz': 'finans',
  'gecmis-altin-fiyatlari': 'finans',
  'gecmis-doviz-kurlari': 'finans',
  'iban-dogrulama': 'finans',

  'kpss-puan': 'egitim-sinav',
  'tyt-puan': 'egitim-sinav',
  'yks-puan': 'egitim-sinav',
  'lgs-puan': 'egitim-sinav',
  'ders-notu': 'egitim-sinav',
  'takdir-tesekkur': 'egitim-sinav',

  'vucut-kitle-endeksi': 'saglik',
  'gunluk-kalori-ihtiyaci': 'saglik',
  'ideal-kilo': 'saglik',
  'yas': 'saglik',

  'kira-artis-orani': 'emlak',
  'yakit-maliyeti': 'otomotiv',
  'yakit-tuketimi': 'otomotiv',
  'maas': 'maas-calisma',
};

class Registry {
  private calculators: Map<string, CalculatorDefinition<any, any>> = new Map();
  private slugMap: Map<string, string> = new Map();

  register(definition: CalculatorDefinition<any, any>): void {
    if (this.calculators.has(definition.id)) {
      throw new Error(`Calculator with ID ${definition.id} is already registered.`);
    }
    if (this.slugMap.has(definition.slug)) {
      throw new Error(`Calculator with slug ${definition.slug} is already registered.`);
    }
    
    this.calculators.set(definition.id, definition);
    this.slugMap.set(definition.slug, definition.id);
  }

  get(id: string): CalculatorDefinition<any, any> | undefined {
    return this.calculators.get(id);
  }

  getBySlug(slug: string): CalculatorDefinition<any, any> | undefined {
    const id = this.slugMap.get(slug);
    if (!id) return undefined;
    return this.calculators.get(id);
  }

  getAll(): CalculatorDefinition<any, any>[] {
    return Array.from(this.calculators.values());
  }

  getPublishedAll(): CalculatorDefinition<any, any>[] {
    return this.getAll().filter(c => c.status === 'published');
  }

  getUiCategory(slug: string, originalCategory: string): string {
    if (CATEGORY_MAP[slug]) return CATEGORY_MAP[slug];
    const fallback: Record<string, string> = {
      'finance': 'finans',
      'math': 'matematik',
      'health': 'saglik',
      'education': 'egitim-sinav'
    };
    return fallback[originalCategory] || 'diger';
  }

  getPublishedByCategory(uiCategoryId: string): CalculatorDefinition<any, any>[] {
    return this.getPublishedAll().filter(
      (calc) => this.getUiCategory(calc.slug, calc.category) === uiCategoryId
    );
  }

  has(id: string): boolean {
    return this.calculators.has(id);
  }
  
  clear(): void {
    this.calculators.clear();
    this.slugMap.clear();
  }
}

export const CalculatorRegistry = new Registry();

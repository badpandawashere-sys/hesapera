import { describe, it, expect } from 'vitest';
import { calculateYakitMaliyeti } from '../yakitMaliyeti';

describe('calculateYakitMaliyeti', () => {
  it('should calculate fuel consumption and cost accurately for standard values', () => {
    // 500 km mesafe, 6.5 L/100km tüketim, 45 TL/L litre fiyatı
    // totalLiters = 500 * 6.5 / 100 = 32.5 L
    // totalCost = 32.5 * 45 = 1462.5 TL
    // costPerKm = 1462.5 / 500 = 2.925 TL/km
    const result = calculateYakitMaliyeti(500, 6.5, 45);

    expect(result.totalLiters).toBeCloseTo(32.5, 4);
    expect(result.totalCost).toBeCloseTo(1462.5, 4);
    expect(result.costPerKm).toBeCloseTo(2.925, 4);
    expect(result.primaryLabel).toBe('Toplam Yakıt Maliyeti');
    expect(result.primaryResult).toContain('1.462,50 TL');
    expect(result.secondaryResults['Tüketilen Yakıt']).toContain('32,50 Litre');
    expect(result.secondaryResults['Kilometre Başı Maliyet']).toContain('2,93 TL / km');
    expect(result.breakdown).toHaveLength(6);
    expect(result.infoReference).toBeDefined();
  });

  it('should calculate accurately with decimals and shorter distance', () => {
    // 80 km mesafe, 5 L/100km, 40 TL/L
    // totalLiters = 80 * 5 / 100 = 4 L
    // totalCost = 4 * 40 = 160 TL
    // costPerKm = 160 / 80 = 2 TL/km
    const result = calculateYakitMaliyeti(80, 5, 40);

    expect(result.totalLiters).toBe(4);
    expect(result.totalCost).toBe(160);
    expect(result.costPerKm).toBe(2);
  });

  it('should calculate accurately for long distance journeys', () => {
    // 1200 km, 6 L/100km, 43.5 TL/L
    // totalLiters = 1200 * 6 / 100 = 72 L
    // totalCost = 72 * 43.5 = 3132 TL
    // costPerKm = 3132 / 1200 = 2.61 TL/km
    const result = calculateYakitMaliyeti(1200, 6, 43.5);

    expect(result.totalLiters).toBe(72);
    expect(result.totalCost).toBeCloseTo(3132, 2);
    expect(result.costPerKm).toBeCloseTo(2.61, 2);
  });

  it('should throw error for zero or negative distance', () => {
    expect(() => calculateYakitMaliyeti(0, 6.5, 45)).toThrow();
    expect(() => calculateYakitMaliyeti(-100, 6.5, 45)).toThrow();
  });

  it('should throw error for zero or negative fuel consumption', () => {
    expect(() => calculateYakitMaliyeti(500, 0, 45)).toThrow();
    expect(() => calculateYakitMaliyeti(500, -5, 45)).toThrow();
  });

  it('should throw error for zero or negative fuel price', () => {
    expect(() => calculateYakitMaliyeti(500, 6.5, 0)).toThrow();
    expect(() => calculateYakitMaliyeti(500, 6.5, -40)).toThrow();
  });

  it('should throw error for NaN or non-finite inputs', () => {
    expect(() => calculateYakitMaliyeti(NaN, 6.5, 45)).toThrow();
    expect(() => calculateYakitMaliyeti(500, NaN, 45)).toThrow();
    expect(() => calculateYakitMaliyeti(500, 6.5, Infinity)).toThrow();
  });
});

describe('yakit-maliyeti registry and sitemap integration', () => {
  it('should be registered in CalculatorRegistry and published under otomotiv', async () => {
    const { CalculatorRegistry } = await import('../../core/calculator-registry');
    await import('../../core/init');

    const calc = CalculatorRegistry.getBySlug('yakit-maliyeti');
    expect(calc).toBeDefined();
    expect(calc?.status).toBe('published');
    expect(calc?.name).toBe('Yakıt Maliyeti Hesaplama');

    const otomotivCalcs = CalculatorRegistry.getPublishedByCategory('otomotiv');
    expect(otomotivCalcs.map(c => c.slug)).toContain('yakit-maliyeti');

    const publishedAll = CalculatorRegistry.getPublishedAll();
    expect(publishedAll.length).toBe(48);
  }, 30000);

  it('should include yakit-maliyeti and otomotiv in sitemap while excluding empty categories', async () => {
    const sitemapModule = await import('../../../app/sitemap');
    const sitemap = sitemapModule.default();

    const urls = sitemap.map(entry => entry.url);
    expect(urls).toContain('https://www.hesapera.com.tr/hesaplama/yakit-maliyeti');
    expect(urls).toContain('https://www.hesapera.com.tr/kategoriler/otomotiv');

    // Empty categories should NOT be in the sitemap
    expect(urls).not.toContain('https://www.hesapera.com.tr/kategoriler/maas-calisma');
    expect(urls).not.toContain('https://www.hesapera.com.tr/kategoriler/vergi');
    expect(urls).not.toContain('https://www.hesapera.com.tr/kategoriler/zaman');
    expect(urls).not.toContain('https://www.hesapera.com.tr/kategoriler/hukuk');
  }, 30000);

  it('should generate correct JSON-LD with WebApplication, Otomotiv Breadcrumb, and 3 FAQs', async () => {
    const { CalculatorRegistry } = await import('../../core/calculator-registry');
    await import('../../core/init');
    const { getCalculatorJsonLd } = await import('../../../components/seo/json-ld');

    const calc = CalculatorRegistry.getBySlug('yakit-maliyeti')!;
    const jsonLd = getCalculatorJsonLd(calc);

    expect(jsonLd['@context']).toBe('https://schema.org');
    const graph = jsonLd['@graph'];

    // WebApplication
    const webApp = graph.find((item: any) => item['@type'] === 'WebApplication');
    expect(webApp).toBeDefined();
    expect(webApp.name).toBe('Yakıt Maliyeti Hesaplama');
    expect(webApp.url).toBe('https://www.hesapera.com.tr/hesaplama/yakit-maliyeti');

    // BreadcrumbList
    const breadcrumb = graph.find((item: any) => item['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0].name).toBe('Ana Sayfa');
    expect(breadcrumb.itemListElement[1].name).toBe('Otomotiv');
    expect(breadcrumb.itemListElement[1].item).toBe('https://www.hesapera.com.tr/kategoriler/otomotiv');
    expect(breadcrumb.itemListElement[2].name).toBe('Yakıt Maliyeti Hesaplama');

    // FAQPage
    const faqPage = graph.find((item: any) => item['@type'] === 'FAQPage');
    expect(faqPage).toBeDefined();
    expect(faqPage.mainEntity).toHaveLength(3);
    expect(faqPage.mainEntity[0].name).toBe('Yolculuk maliyeti hesabında L/100 km değeri nasıl kullanılır?');
    expect(faqPage.mainEntity[1].name).toBe('Planlanan yolculukta kilometre başına maliyet nasıl bulunur?');
    expect(faqPage.mainEntity[2].name).toBe('Klima yakıt tüketimini ne kadar artırır?');
  }, 30000);

  it('should generate correct metadata via app/hesaplama/[slug]/page.tsx generateMetadata', async () => {
    const pageModule = await import('../../../app/hesaplama/[slug]/page');
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ slug: 'yakit-maliyeti' })
    });

    expect(metadata.title).toBe('Yakıt Maliyeti Hesaplama: Yolculuk Ne Kadar Tutar? | Hesapera');
    expect(metadata.description).toContain('Gideceğiniz mesafe');
    expect(metadata.alternates?.canonical).toBe('https://www.hesapera.com.tr/hesaplama/yakit-maliyeti');
    expect(metadata.openGraph?.title).toBe('Yakıt Maliyeti Hesaplama: Yolculuk Ne Kadar Tutar? | Hesapera');
    expect(metadata.twitter?.title).toBe('Yakıt Maliyeti Hesaplama: Yolculuk Ne Kadar Tutar? | Hesapera');
  }, 30000);

  it('should generate correct category metadata and find published calculators for otomotiv', async () => {
    const categoryPageModule = await import('../../../app/kategoriler/[id]/page');
    const metadata = await categoryPageModule.generateMetadata({
      params: Promise.resolve({ id: 'otomotiv' })
    });

    expect(metadata.title).toBe('Otomotiv Hesaplamaları | Hesapera');
    expect(metadata.alternates?.canonical).toBe('https://www.hesapera.com.tr/kategoriler/otomotiv');
  });
});


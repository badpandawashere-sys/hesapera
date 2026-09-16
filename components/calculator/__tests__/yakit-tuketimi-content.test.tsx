import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CalculatorPage from '@/app/hesaplama/[slug]/page';
import sitemap from '@/app/sitemap';
import { getCalculatorJsonLd } from '@/components/seo/json-ld';
import { yakitMaliyetiCalculatorDef } from '@/calculators/definitions/yakitMaliyeti';
import { yakitTuketimiCalculatorDef } from '@/calculators/definitions/yakitTuketimi';

afterEach(() => vi.unstubAllEnvs());

describe('Yakıt tüketimi final content and SEO intent', () => {
  it('renders the final content package in the development preview', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(await CalculatorPage({ params: Promise.resolve({ slug: 'yakit-tuketimi' }) }));

    expect(screen.getByText(yakitTuketimiCalculatorDef.shortDescription)).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Nasıl Hesaplanır?' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Gerçek Örnek' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Yakıt Maliyeti vs Yakıt Tüketimi' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'TL/km ile L/100 km Arasındaki Fark' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Sonuçları Nasıl Yorumlamalısınız?' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Sıkça Sorulan Sorular' })).toBeDefined();

    for (const item of yakitTuketimiCalculatorDef.metadata.faq ?? []) {
      expect(screen.getByText(item.question)).toBeDefined();
      expect(screen.getByText(item.answer)).toBeDefined();
    }

    const fuelCostLinks = screen.getAllByRole('link', { name: 'Yakıt Maliyeti Hesaplama' });
    const vehicleLoanLinks = screen.getAllByRole('link', { name: 'Taşıt Kredisi Hesaplama' });
    expect(fuelCostLinks.some(link => link.getAttribute('href') === '/hesaplama/yakit-maliyeti')).toBe(true);
    expect(vehicleLoanLinks.some(link => link.getAttribute('href') === '/hesaplama/tasit-kredisi')).toBe(true);
  });

  it('uses one six-item FAQ source for visible content and FAQPage JSON-LD', () => {
    const faq = yakitTuketimiCalculatorDef.metadata.faq ?? [];
    const jsonLd = getCalculatorJsonLd(yakitTuketimiCalculatorDef as any);
    const faqPage = jsonLd['@graph'].find((item: { '@type': string }) => item['@type'] === 'FAQPage');

    expect(faq).toHaveLength(6);
    expect(faqPage.mainEntity).toEqual(faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })));
  });

  it('keeps related calculators ordered, published-only and free of self-links', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(await CalculatorPage({ params: Promise.resolve({ slug: 'yakit-tuketimi' }) }));

    const relatedHeading = screen.getByRole('heading', { name: 'İlgili Hesaplamalar' });
    const relatedSection = relatedHeading.closest('section');
    const links = Array.from(relatedSection?.querySelectorAll('a') ?? []);
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/hesaplama/yakit-maliyeti',
      '/hesaplama/tasit-kredisi',
    ]);
    expect(links.some(link => link.getAttribute('href') === '/hesaplama/yakit-tuketimi')).toBe(false);
  });

  it('separates completed-trip analysis from future-trip planning', () => {
    expect(yakitTuketimiCalculatorDef.name).not.toBe(yakitMaliyetiCalculatorDef.name);
    expect(yakitTuketimiCalculatorDef.metadata.title).toContain('Ne Kadar Yaktım?');
    expect(yakitMaliyetiCalculatorDef.metadata.title).toContain('Yolculuk Ne Kadar Tutar?');
    expect(yakitTuketimiCalculatorDef.metadata.title).not.toBe(yakitMaliyetiCalculatorDef.metadata.title);
    expect(yakitTuketimiCalculatorDef.metadata.description).toContain('gerçekleşmiş yolculuğun');
    expect(yakitMaliyetiCalculatorDef.metadata.description).toContain('Gideceğiniz mesafe');
    expect(yakitTuketimiCalculatorDef.metadata.content?.intro).not.toBe(yakitMaliyetiCalculatorDef.metadata.content?.intro);
    expect(yakitTuketimiCalculatorDef.metadata.content?.sections).not.toEqual(yakitMaliyetiCalculatorDef.metadata.content?.sections);
  });

  it('is published and included in the sitemap', () => {
    expect(yakitTuketimiCalculatorDef.status).toBe('published');
    expect(sitemap().map(item => item.url)).toContain(yakitTuketimiCalculatorDef.metadata.canonical);
  });
});

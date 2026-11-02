import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Manrope: () => ({ variable: '--font-heading' }),
  Plus_Jakarta_Sans: () => ({ variable: '--font-sans' }),
  JetBrains_Mono: () => ({ variable: '--font-mono' }),
}));

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    usePathname: () => '/',
  };
});

import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { CalculatorEngine } from '@/calculators/core/calculator-engine';
import '@/calculators/core/init';
import { categories } from '@/lib/data/categories';
import sitemap from '@/app/sitemap';
import CalculatorPage, { generateMetadata as generateCalcMetadata } from '@/app/hesaplama/[slug]/page';
import HesaplamaIndexPage, { metadata as hesaplamaIndexMetadata } from '@/app/hesaplama/page';
import RehberIndexPage from '@/app/rehber/page';
import { metadata as rootMetadata } from '@/app/layout';
import HomePage from '@/app/page';
import AboutPage from '@/app/hakkimizda/page';
import PrivacyPage from '@/app/gizlilik/page';
import CookiePolicyPage from '@/app/cerez/page';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AdBanner } from '@/components/ads/ad-banner';
import { RelatedCalculators, SEMANTIC_RELATIONS } from '../related-calculators';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { getCalculatorJsonLd } from '@/components/seo/json-ld';
import { CalculatorMainResultCard, CalculatorInfoCard } from '@/components/calculator/calculator-result';
import { calculateAction } from '@/app/actions/calculate';

describe('AdSense Stage 1 Regression Suite', () => {
  describe('1. Draft URL Cleanup & Inventory Protection', () => {
    it('1.1 preserves 62 published and 78 draft calculators in registry (140 total)', () => {
      const all = CalculatorRegistry.getAll();
      const published = CalculatorRegistry.getPublishedAll();
      const drafts = all.filter((c) => c.status === 'draft');

      expect(all.length).toBe(140);
      expect(published.length).toBe(62);
      expect(drafts.length).toBe(78);
    });

    it('1.2 throws NEXT_NOT_FOUND (HTTP 404) when CalculatorPage is called with a draft slug', async () => {
      await expect(
        CalculatorPage({ params: Promise.resolve({ slug: 'bilesik-faiz' }) })
      ).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK/);
    });

    it('1.3 blocks Server Action calculateAction execution for draft calculators', async () => {
      const res = await calculateAction('bilesik-faiz', { principal: 1000 });
      expect(res.success).toBe(false);
      expect(res.errors?.join(' ')).toMatch(/yayında değil|bulunamadı/i);
    });

    it('1.4 excludes all 78 draft calculators from sitemap and includes all 62 published calculators', () => {
      const entries = sitemap();
      const urls = new Set(entries.map((e) => e.url));
      const all = CalculatorRegistry.getAll();

      for (const calc of all) {
        const calcUrl = `https://www.hesapera.com.tr/hesaplama/${calc.slug}`;
        if (calc.status === 'published') {
          expect(urls.has(calcUrl)).toBe(true);
        } else {
          expect(urls.has(calcUrl)).toBe(false);
        }
      }
    });
  });

  describe('2. Broken Result Screens & Engine-UI Data Contract', () => {
    it('2.1 iyos-puan returns primitive primaryResult and renders without crashing React', async () => {
      const res = await CalculatorEngine.runBySlug('iyos-puan', {
        system: 'current',
        hp: 84,
        x: 72,
        s: 14,
        b: 110,
      });

      expect(res.success).toBe(true);
      expect(['string', 'number']).toContain(typeof res.data?.primaryResult);
      expect(res.data?.secondaryResults?.['Başarı Durumu']).toBe('Başarılı');

      const { container } = render(
        <CalculatorMainResultCard result={res} calculatorName="İYÖS Puan Hesaplama" />
      );
      expect(container.textContent).toContain('78,33333');
      expect(container.textContent).toContain('Başarılı');
    });

    it('2.2 iyos-puan without X/S/B stats displays Ham Puan and methodology note without crashing', async () => {
      const res = await CalculatorEngine.runBySlug('iyos-puan', {
        system: 'current',
        hp: 84,
      });

      expect(res.success).toBe(true);
      expect(res.data?.primaryResult).toBe('84');
      expect(res.notes?.[0]).toContain('kesin İYÖS puanı hesaplanamaz');

      const { container } = render(
        <CalculatorMainResultCard result={res} calculatorName="İYÖS Puan Hesaplama" />
      );
      expect(container.textContent).toContain('84');
      expect(container.textContent).toContain('kesin İYÖS puanı hesaplanamaz');
    });

    it('2.3 iyos-puan formats Zod validation errors cleanly instead of raw JSON', async () => {
      const res = await CalculatorEngine.runBySlug('iyos-puan', {
        system: 'current',
        hp: 84,
        x: 72,
      });

      expect(res.success).toBe(false);
      expect(res.errors?.[0]).toContain('x: Puan hesaplamak için Ortalama Ham Puan');
      expect(res.errors?.[0]).not.toContain('"code"');
    });

    it('2.4 hmgs-puan returns success:false on validation failure instead of crashing React with an error object', async () => {
      const res = await CalculatorEngine.runBySlug('hmgs-puan', {
        system: 'current',
        hp: 84,
        x: 72,
        s: 14,
      });

      expect(res.success).toBe(false);
      expect(res.errors?.[0]).toContain('Ortalama Ham Puan, Standart Sapma ve En Yüksek Ham Puan');

      const { container } = render(
        <CalculatorMainResultCard result={res} calculatorName="HMGS Puan Hesaplama" />
      );
      expect(container.textContent).toContain('Hesaplama Hatası');
    });

    it('2.5 hmgs-puan surfaces formula notes in CalculatorMainResultCard', async () => {
      const res = await CalculatorEngine.runBySlug('hmgs-puan', {
        system: 'current',
        hp: 84,
      });

      expect(res.success).toBe(true);
      expect(res.notes?.length).toBeGreaterThan(0);

      const { container } = render(
        <CalculatorMainResultCard result={res} calculatorName="HMGS Puan Hesaplama" />
      );
      expect(container.textContent).toContain('kesin HMGS puanı hesaplanamaz');
    });

    it('2.6 isg-puan returns success:false on validation failure instead of crashing React', async () => {
      const res = await CalculatorEngine.runBySlug('isg-puan', {
        certificate: 'cClass',
        correct: 50,
        cancelled: 1,
      });

      expect(res.success).toBe(false);
      expect(res.errors?.[0]).toContain('correct: Doğru sayısı geçerli soru sayısından (49) büyük olamaz.');

      const { container } = render(
        <CalculatorMainResultCard result={res} calculatorName="İSG Puan Hesaplama" />
      );
      expect(container.textContent).toContain('Hesaplama Hatası');
    });

    it('2.7 h-kim-ve-savci-yardimciligi-sinavi-puan renders calculated nets and notes in UI', async () => {
      const res = await CalculatorEngine.runBySlug('h-kim-ve-savci-yardimciligi-sinavi-puan', {
        gygk_correct: 30,
        gygk_wrong: 0,
        ortak_correct: 35,
        ortak_wrong: 0,
        adli_correct: 35,
        adli_wrong: 0,
      });

      expect(res.success).toBe(true);
      expect(res.data?.secondaryResults?.['Genel Yetenek ve Genel Kültür Neti']).toBe('30.00');
      expect(res.data?.secondaryResults?.['Ortak Alan Bilgisi Neti']).toBe('35.00');
      expect(res.data?.secondaryResults?.['Adli Yargı Neti']).toBe('35.00');
      expect(res.data?.secondaryResults?.['Adli Yargı Toplam Net']).toBe('100.00');
      expect(res.notes?.length).toBeGreaterThan(0);

      const { container } = render(
        <CalculatorMainResultCard
          result={res}
          calculatorName="Hâkim ve Savcı Yardımcılığı Sınavı Puan Hesaplama"
        />
      );
      expect(container.textContent).toContain('100.00');
      expect(container.textContent).toContain('30.00');
      expect(container.textContent).toContain('12 alt testin ayrı ayrı standartlaştırılmasıyla');
    });
  });

  describe('3. Categories & Internal Links', () => {
    it('3.1 maps all 62 published calculators to valid categories in categories.ts (zero "diger" orphans)', () => {
      const validCategoryIds = new Set(categories.map((c) => c.id));
      const published = CalculatorRegistry.getPublishedAll();

      for (const calc of published) {
        const uiCat = CalculatorRegistry.getUiCategory(calc.slug, calc.category);
        expect(uiCat).not.toBe('diger');
        expect(validCategoryIds.has(uiCat)).toBe(true);
      }

      const totalMapped = categories.reduce(
        (sum, cat) => sum + CalculatorRegistry.getPublishedByCategory(cat.id).length,
        0
      );
      expect(totalMapped).toBe(62);
    });

    it('3.2 assigns kidem-tazminati, lastik-ebat-hesaplama, kdv-hesaplama, is-yeri-kredisi, and kredi-erken-kapatma-cezasi to correct categories', () => {
      expect(CalculatorRegistry.getUiCategory('kidem-tazminati', 'other')).toBe('maas-calisma');
      expect(CalculatorRegistry.getUiCategory('lastik-ebat-hesaplama', 'other')).toBe('otomotiv');
      expect(CalculatorRegistry.getUiCategory('kdv-hesaplama', 'finance')).toBe('vergi');
      expect(CalculatorRegistry.getUiCategory('is-yeri-kredisi', 'finance')).toBe('kredi');
      expect(CalculatorRegistry.getUiCategory('kredi-erken-kapatma-cezasi', 'finance')).toBe('kredi');
    });

    it('3.3 generates valid non-404 Breadcrumbs and JSON-LD for kidem-tazminati and lastik-ebat-hesaplama', () => {
      const kidem = CalculatorRegistry.getBySlug('kidem-tazminati')!;
      const lastik = CalculatorRegistry.getBySlug('lastik-ebat-hesaplama')!;

      const { container: c1 } = render(
        <Breadcrumbs
          category={kidem.category}
          calculatorName={kidem.name}
          calculatorSlug={kidem.slug}
        />
      );
      const links1 = Array.from(c1.querySelectorAll('a')).map((a) => a.getAttribute('href'));
      expect(links1).toContain('/kategoriler/maas-calisma');
      expect(links1).not.toContain('/kategoriler/diger');

      const jsonLd1 = JSON.stringify(getCalculatorJsonLd(kidem));
      expect(jsonLd1).toContain('/kategoriler/maas-calisma');
      expect(jsonLd1).not.toContain('/kategoriler/diger');

      const jsonLd2 = JSON.stringify(getCalculatorJsonLd(lastik));
      expect(jsonLd2).toContain('/kategoriler/otomotiv');
      expect(jsonLd2).not.toContain('/kategoriler/diger');
    });

    it('3.4 renders related calculators for maas, kidem-tazminati, kdv-hesaplama, and lastik-ebat-hesaplama', () => {
      for (const slug of ['maas', 'kidem-tazminati', 'kdv-hesaplama', 'lastik-ebat-hesaplama']) {
        const calc = CalculatorRegistry.getBySlug(slug)!;
        const { container } = render(
          <RelatedCalculators category={calc.category} currentSlug={calc.slug} />
        );
        const links = container.querySelectorAll('a');
        expect(links.length).toBeGreaterThan(0);
      }
    });
  });

  describe('4. Privacy, Corporate Accuracy & AdSense Verification', () => {
    it('4.1 PrivacyPage and CookiePolicyPage disclose Google AdSense / advertising cookies and do not claim inputs are never sent to server', () => {
      const { container: privacyContainer } = render(<PrivacyPage />);
      expect(privacyContainer.textContent).toMatch(/Google AdSense|DoubleClick|adssettings\.google\.com/i);
      expect(privacyContainer.textContent).not.toMatch(/sunucularımıza iletilmez/i);

      const { container: cookieContainer } = render(<CookiePolicyPage />);
      expect(cookieContainer.textContent).toMatch(/Google AdSense|Reklam|adssettings\.google\.com/i);
    });

    it('4.2 AboutPage does not claim "Reklamsız" or "PDF veya resim olarak paylaşma"', () => {
      const { container } = render(<AboutPage />);
      expect(container.textContent).not.toMatch(/Reklamsız/i);
      expect(container.textContent).not.toMatch(/PDF veya resim olarak paylaşma/i);
      expect(container.textContent).not.toMatch(/40\+/);
      expect(container.textContent).toContain('62');
    });

    it('4.3 AdBanner does not render an empty "Reklam" placeholder box', () => {
      const { container } = render(<AdBanner placement="homepage-after-popular" />);
      expect(container.textContent).not.toContain('Reklam');
    });

    it('4.4 RootLayout preserves google-adsense-account metadata', () => {
      expect((rootMetadata.other as any)?.['google-adsense-account']).toBe('ca-pub-6226482996926045');
    });
  });

  describe('5. Homepage, Navigation & Dead Controls', () => {
    it('5.1 HomePage displays accurate dynamic published calculator and active category counts without "120+" or "14 Kategori"', () => {
      const { container } = render(<HomePage />);
      expect(container.textContent).not.toContain('120+');
      expect(container.textContent).not.toContain('Top 14 Kategori');
      expect(container.textContent).not.toContain('Tüm 14 Kategoriyi İncele');
      expect(container.textContent).toContain('62');
    });

    it('5.2 Footer does not claim "yüzlerce araca"', () => {
      const { container } = render(<Footer />);
      expect(container.textContent).not.toMatch(/yüzlerce araca/i);
    });

    it('5.3 Header navigation is visible at md (tablet) breakpoint', () => {
      const { container } = render(<Header />);
      const nav = container.querySelector('nav');
      expect(nav?.className).toContain('md:flex');
    });

    it('5.4 CalculatorInfoCard does not render a dead "Daha Fazla Oku" button', () => {
      const { container } = render(
        <CalculatorInfoCard
          result={{
            success: true,
            data: {
              primaryResult: 100,
              infoReference: { title: 'Bilgi', description: 'Açıklama' },
            },
          }}
        />
      );
      expect(container.textContent).not.toContain('Daha Fazla Oku');
    });
  });

  describe('6. SEO, Canonicals & Sitemap Parity', () => {
    it('6.1 /hesaplama index page has canonical metadata and is included in sitemap.xml', () => {
      expect(hesaplamaIndexMetadata.alternates?.canonical).toBe(
        'https://www.hesapera.com.tr/hesaplama'
      );
      const entries = sitemap();
      expect(entries.some((e) => e.url === 'https://www.hesapera.com.tr/hesaplama')).toBe(true);
    });

    it('6.2 all 140 calculator definitions (62 published + 78 draft) have canonical URLs pointing to https://www.hesapera.com.tr/hesaplama/<slug>', () => {
      const all = CalculatorRegistry.getAll();
      for (const calc of all) {
        expect(calc.metadata.canonical).toBe(
          `https://www.hesapera.com.tr/hesaplama/${calc.slug}`
        );
      }
    });

    it('6.3 /rehber, /hesaplama, HomePage and all published relatedCalculators link exclusively to published and accessible URLs (zero draft links)', () => {
      const rehberRender = render(<RehberIndexPage />);
      const rehberLinks = Array.from(rehberRender.container.querySelectorAll('a')).map((a) =>
        a.getAttribute('href')
      );
      expect(rehberLinks.length).toBe(62);
      for (const href of rehberLinks) {
        expect(href).toMatch(/^\/hesaplama\/[a-z0-9-]+$/);
        const slug = href!.replace('/hesaplama/', '');
        const calc = CalculatorRegistry.getBySlug(slug);
        expect(calc?.status).toBe('published');
      }

      const hesaplamaRender = render(<HesaplamaIndexPage />);
      const hesaplamaLinks = Array.from(hesaplamaRender.container.querySelectorAll('a')).map((a) =>
        a.getAttribute('href')
      );
      expect(hesaplamaLinks.length).toBe(62);
      for (const href of hesaplamaLinks) {
        const slug = href!.replace('/hesaplama/', '');
        expect(CalculatorRegistry.getBySlug(slug)?.status).toBe('published');
      }

      const published = CalculatorRegistry.getPublishedAll();
      for (const calc of published) {
        for (const relSlug of calc.metadata.relatedCalculators || []) {
          const relCalc = CalculatorRegistry.getBySlug(relSlug);
          expect(
            relCalc?.status,
            `${calc.slug} has non-published relatedCalculator: ${relSlug}`
          ).toBe('published');
        }
      }
    });

    it('6.4 CalculatorEngine changes do not affect mathematical outputs of other finance, loan, tax, math, health and exam calculators', async () => {
      // 1. Loan / Finance: ihtiyac-kredisi
      const loanRes = await CalculatorEngine.runBySlug('ihtiyac-kredisi', {
        loanAmount: 100000,
        monthlyInterestRate: 3.5,
        termMonths: 12,
      });
      expect(loanRes.success).toBe(true);
      expect(loanRes.data?.primaryResult).toBeDefined();

      // 2. Finance: vadeli-mevduat-faizi
      const depositRes = await CalculatorEngine.runBySlug('vadeli-mevduat-faizi', {
        principal: 100000,
        interestRate: 45,
        maturityType: 'days',
        maturity: 32,
        taxRate: 15,
      });
      expect(depositRes.success).toBe(true);
      expect(depositRes.data?.primaryResult).toBeDefined();

      // 3. Finance / Tax: kdv-hesaplama
      const vatRes = await CalculatorEngine.runBySlug('kdv-hesaplama', {
        tutar: 1000,
        oran: 20,
        mod: 'ekle',
      });
      expect(vatRes.success).toBe(true);
      expect(vatRes.data?.primaryResult).toBeDefined();

      // 4. Math: yuzde
      const pctRes = await CalculatorEngine.runBySlug('yuzde', {
        baseValue: 500,
        percentage: 20,
      });
      expect(pctRes.success).toBe(true);
      expect(pctRes.data?.primaryResult).toBe(100);

      // 5. Health: vucut-kitle-endeksi
      const bmiRes = await CalculatorEngine.runBySlug('vucut-kitle-endeksi', {
        boy: 180,
        kilo: 81,
      });
      expect(bmiRes.success).toBe(true);
      expect(bmiRes.data?.primaryResult).toBeDefined();

      // 6. Exam: ekpss-puan
      const ekpssRes = await CalculatorEngine.runBySlug('ekpss-puan', {
        educationLevel: 'bachelor',
        gyCorrect: 25,
        gyWrong: 4,
        gkCorrect: 25,
        gkWrong: 4,
      });
      expect(ekpssRes.success).toBe(true);
      expect(ekpssRes.data?.primaryResult).toBeDefined();
    });

    it('6.5 SEMANTIC_RELATIONS and metadata.relatedCalculators are in complete harmony and contain no random fallback recommendations', () => {
      const published = CalculatorRegistry.getPublishedAll();

      for (const calc of published) {
        const defRelated = calc.metadata?.relatedCalculators || [];
        const semRelated = SEMANTIC_RELATIONS[calc.slug] || [];

        // Exact match between definition and SEMANTIC_RELATIONS
        expect(defRelated, `Mismatch in ${calc.slug}`).toEqual(semRelated);

        // Every target must be a valid published calculator and not self
        for (const targetSlug of defRelated) {
          expect(targetSlug).not.toBe(calc.slug);
          const target = CalculatorRegistry.getBySlug(targetSlug);
          expect(target?.status, `Target ${targetSlug} in ${calc.slug} must be published`).toBe('published');
        }
      }

      // Standalone tools with no genuine published peers must have empty related lists
      expect(CalculatorRegistry.getBySlug('faktoriyel')?.metadata?.relatedCalculators).toEqual([]);
      expect(CalculatorRegistry.getBySlug('koklu-sayi')?.metadata?.relatedCalculators).toEqual([]);
      expect(CalculatorRegistry.getBySlug('ebob-ekok')?.metadata?.relatedCalculators).toEqual([]);
      expect(CalculatorRegistry.getBySlug('isg-puan')?.metadata?.relatedCalculators).toEqual([]);
      expect(CalculatorRegistry.getBySlug('eus-puan')?.metadata?.relatedCalculators).toEqual([]);
      expect(CalculatorRegistry.getBySlug('iban-dogrulama')?.metadata?.relatedCalculators).toEqual([]);

      // RelatedCalculators component must return null for tools with empty relations (no random fallback)
      const { container: faktoriyelContainer } = render(
        <RelatedCalculators category="math" currentSlug="faktoriyel" />
      );
      expect(faktoriyelContainer.firstChild).toBeNull();

      const { container: isgContainer } = render(
        <RelatedCalculators category="education" currentSlug="isg-puan" />
      );
      expect(isgContainer.firstChild).toBeNull();
    });
  });
});

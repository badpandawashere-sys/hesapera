import { describe, it, expect } from 'vitest';
import { getHomepageJsonLd, getCalculatorJsonLd } from '../json-ld';

describe('JSON-LD SEO Generators', () => {
  it('should generate correct Homepage JSON-LD', () => {
    const data = getHomepageJsonLd();
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toHaveLength(2);
    const website = data['@graph'].find((g: any) => g['@type'] === 'WebSite');
    const org = data['@graph'].find((g: any) => g['@type'] === 'Organization');
    expect(website!.url).toBe('https://www.hesapera.com.tr/');
    expect(org!.logo!.url).toBe('https://www.hesapera.com.tr/logo.png');
  });

  it('should generate WebApplication for published calculators', () => {
    const mockCalc: any = {
      name: 'Test Calc',
      slug: 'test-calc',
      shortDescription: 'Desc',
      metadata: {}
    };
    const data = getCalculatorJsonLd(mockCalc);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toHaveLength(1);
    const webapp = data['@graph'].find((g: any) => g['@type'] === 'WebApplication');
    expect(webapp!.url).toBe('https://www.hesapera.com.tr/hesaplama/test-calc');
    expect(webapp!.name).toBe('Test Calc');
  });

  it('should generate FAQPage if calculator has FAQ', () => {
    const mockCalc: any = {
      name: 'Test Calc',
      slug: 'test-calc',
      shortDescription: 'Desc',
      metadata: {
        faq: [
          { question: 'Q1', answer: 'A1' }
        ]
      }
    };
    const data = getCalculatorJsonLd(mockCalc);
    expect(data['@graph']).toHaveLength(2);
    const faq = data['@graph'].find((g: any) => g['@type'] === 'FAQPage');
    expect(faq!.mainEntity).toHaveLength(1);
    expect(faq!.mainEntity[0].name).toBe('Q1');
    expect(faq!.mainEntity[0].acceptedAnswer.text).toBe('A1');
  });
});

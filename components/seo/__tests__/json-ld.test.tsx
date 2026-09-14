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

  it('should generate WebApplication and BreadcrumbList for published calculators', () => {
    const mockCalc: any = {
      name: 'Test Calc',
      slug: 'test-calc',
      category: 'finance',
      shortDescription: 'Desc',
      metadata: {}
    };
    const data = getCalculatorJsonLd(mockCalc);
    expect(data['@context']).toBe('https://schema.org');
    
    // Should have exactly 2 graphs: WebApp and BreadcrumbList
    expect(data['@graph']).toHaveLength(2);
    
    const webapp = data['@graph'].find((g: any) => g['@type'] === 'WebApplication');
    expect(webapp!.url).toBe('https://www.hesapera.com.tr/hesaplama/test-calc');
    expect(webapp!.name).toBe('Test Calc');

    const breadcrumb = data['@graph'].find((g: any) => g['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(3);
    
    // Position 1
    expect(breadcrumb.itemListElement[0].position).toBe(1);
    expect(breadcrumb.itemListElement[0].name).toBe('Ana Sayfa');
    expect(breadcrumb.itemListElement[0].item).toBe('https://www.hesapera.com.tr/');
    
    // Position 2
    expect(breadcrumb.itemListElement[1].position).toBe(2);
    expect(breadcrumb.itemListElement[1].name).toBe('Finans');
    expect(breadcrumb.itemListElement[1].item).toBe('https://www.hesapera.com.tr/kategoriler/finans');
    
    // Position 3
    expect(breadcrumb.itemListElement[2].position).toBe(3);
    expect(breadcrumb.itemListElement[2].name).toBe('Test Calc');
    expect(breadcrumb.itemListElement[2].item).toBe('https://www.hesapera.com.tr/hesaplama/test-calc');
  });

  it('should generate FAQPage if calculator has FAQ', () => {
    const mockCalc: any = {
      name: 'Test Calc',
      slug: 'test-calc',
      category: 'finance',
      shortDescription: 'Desc',
      metadata: {
        faq: [
          { question: 'Q1', answer: 'A1' }
        ]
      }
    };
    const data = getCalculatorJsonLd(mockCalc);
    
    // Now should be 3: WebApp, BreadcrumbList, FAQPage
    expect(data['@graph']).toHaveLength(3);
    const faq = data['@graph'].find((g: any) => g['@type'] === 'FAQPage');
    expect(faq!.mainEntity).toHaveLength(1);
    expect(faq!.mainEntity[0].name).toBe('Q1');
    expect(faq!.mainEntity[0].acceptedAnswer.text).toBe('A1');
    
    const webapp = data['@graph'].find((g: any) => g['@type'] === 'WebApplication');
    expect(webapp).toBeDefined();
    const breadcrumb = data['@graph'].find((g: any) => g['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
  });
});

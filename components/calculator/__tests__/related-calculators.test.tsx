import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RelatedCalculators } from '../related-calculators';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';

// Mock the Link component since it requires routing context in Next.js
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href} data-testid="mock-link">{children}</a>
}));

describe('RelatedCalculators', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const createMockCalc = (slug: string, name: string) => ({
    slug,
    name,
    shortDescription: `Desc ${name}`,
    metadata: {},
    status: 'published'
  } as any);

  it('renders semantic calculators first and limits to 4', () => {
    vi.spyOn(CalculatorRegistry, 'getBySlug').mockImplementation((slug) => {
      if (['oran', 'basit-faiz', 'bilesik-buyume'].includes(slug)) {
        return createMockCalc(slug, slug);
      }
      return undefined;
    });

    vi.spyOn(CalculatorRegistry, 'getUiCategory').mockReturnValue('matematik');
    
    vi.spyOn(CalculatorRegistry, 'getPublishedByCategory').mockReturnValue([
      createMockCalc('ebob-ekok', 'Ebob Ekok'),
      createMockCalc('koklu-sayi', 'Koklu Sayi'),
      createMockCalc('metrekare', 'Metrekare')
    ]);

    render(<RelatedCalculators category="math" currentSlug="yuzde" />);

    expect(screen.getByText('İlgili Hesaplamalar')).toBeDefined();

    const links = screen.getAllByTestId('mock-link');
    expect(links.length).toBe(4);

    // Semantic should be first 3
    expect(links[0].getAttribute('href')).toBe('/hesaplama/oran');
    expect(links[1].getAttribute('href')).toBe('/hesaplama/basit-faiz');
    expect(links[2].getAttribute('href')).toBe('/hesaplama/bilesik-buyume');
    
    // Fallback should fill the 4th spot
    expect(links[3].getAttribute('href')).toBe('/hesaplama/ebob-ekok');
  });

  it('filters out current calculator and prevents duplicates', () => {
    vi.spyOn(CalculatorRegistry, 'getBySlug').mockImplementation((slug) => {
      if (['enflasyon', 'konut-kredisi'].includes(slug)) {
        return createMockCalc(slug, slug);
      }
      return undefined;
    });

    vi.spyOn(CalculatorRegistry, 'getUiCategory').mockReturnValue('emlak');
    
    vi.spyOn(CalculatorRegistry, 'getPublishedByCategory').mockReturnValue([
      createMockCalc('konut-kredisi', 'konut-kredisi'), // Duplicate from semantic
      createMockCalc('kira-artis-orani', 'Kira Artis'), // Current slug
      createMockCalc('ihtiyac-kredisi', 'ihtiyac-kredisi')
    ]);

    render(<RelatedCalculators category="finance" currentSlug="kira-artis-orani" />);

    const links = screen.getAllByTestId('mock-link');
    expect(links.length).toBe(3);

    expect(links[0].getAttribute('href')).toBe('/hesaplama/enflasyon');
    expect(links[1].getAttribute('href')).toBe('/hesaplama/konut-kredisi');
    expect(links[2].getAttribute('href')).toBe('/hesaplama/ihtiyac-kredisi');
    
    expect(screen.queryByText('Kira Artis')).toBeNull();
  });

  it('renders nothing if no semantic and no fallback', () => {
    vi.spyOn(CalculatorRegistry, 'getBySlug').mockReturnValue(undefined);
    vi.spyOn(CalculatorRegistry, 'getUiCategory').mockReturnValue('diger');
    vi.spyOn(CalculatorRegistry, 'getPublishedByCategory').mockReturnValue([
      createMockCalc('current-calc', 'Current')
    ]);

    const { container } = render(<RelatedCalculators category="finance" currentSlug="current-calc" />);
    expect(container.firstChild).toBeNull();
  });
});

import { Children, isValidElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CalculatorPage, { generateMetadata } from '@/app/hesaplama/[slug]/page';
import { ComingSoon } from '../coming-soon';
import { YakitTuketimiForm } from '../yakit-tuketimi-form';
import { RelatedCalculators } from '../related-calculators';

afterEach(() => vi.unstubAllEnvs());

// Inspect the async page's returned element tree, without asking jsdom to render an async RSC.
function countComponent(node: ReactNode, component: unknown): number {
  let count = 0;
  Children.forEach(node, child => {
    if (isValidElement<{ children?: ReactNode }>(child)) {
      if (child.type === component) count += 1;
      count += countComponent(child.props.children, component);
    }
  });
  return count;
}

describe('Yakıt tüketimi published page', () => {
  it.each(['production', 'test', 'development'])('renders the calculator and indexable metadata in %s', async environment => {
    vi.stubEnv('NODE_ENV', environment);
    const props = { params: Promise.resolve({ slug: 'yakit-tuketimi' }) };
    const page = await CalculatorPage(props);
    expect(countComponent(page, YakitTuketimiForm)).toBe(1);
    expect(page.type).not.toBe(ComingSoon);
    expect((await generateMetadata(props)).robots).toBeUndefined();
  });

  it('keeps one related section and other drafts on ComingSoon', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const props = { params: Promise.resolve({ slug: 'yakit-tuketimi' }) };
    const page = await CalculatorPage(props);
    expect(countComponent(page, YakitTuketimiForm)).toBe(1);
    expect(countComponent(page, RelatedCalculators)).toBe(1);
    expect((await CalculatorPage({ params: Promise.resolve({ slug: 'adet-gunu' }) })).type).toBe(ComingSoon);
  });
});

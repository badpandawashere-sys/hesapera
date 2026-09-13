import { describe, it, expect } from 'vitest';
import { metadata as homeMeta } from '@/app/page';
import { metadata as rehberMeta } from '@/app/rehber/page';
import { metadata as kategorilerMeta } from '@/app/kategoriler/page';
import { generateMetadata as categoryGenerateMetadata } from '@/app/kategoriler/[id]/page';
import { generateMetadata as calculatorGenerateMetadata } from '@/app/hesaplama/[slug]/page';

describe('SEO Metadata', () => {

  it('should have openGraph and twitter in homepage', () => {
    expect(homeMeta.openGraph).toBeDefined();
    expect((homeMeta.openGraph as any).url).toBe('https://www.hesapera.com.tr/');
    expect(homeMeta.twitter).toBeDefined();
  });

  it('should have openGraph and twitter in rehber', () => {
    expect(rehberMeta.openGraph).toBeDefined();
    expect((rehberMeta.openGraph as any).url).toBe('https://www.hesapera.com.tr/rehber');
    expect(rehberMeta.twitter).toBeDefined();
  });

  it('should have openGraph and twitter in kategoriler', () => {
    expect(kategorilerMeta.openGraph).toBeDefined();
    expect((kategorilerMeta.openGraph as any).url).toBe('https://www.hesapera.com.tr/kategoriler');
    expect(kategorilerMeta.twitter).toBeDefined();
  });

  it('should generate correct metadata for dynamic category', async () => {
    const meta = await categoryGenerateMetadata({ params: Promise.resolve({ id: 'finans' }) } as any);
    expect(meta.openGraph).toBeDefined();
    expect((meta.openGraph as any).url).toContain('https://www.hesapera.com.tr/');
    expect(meta.twitter).toBeDefined();
  });

  it('should generate correct metadata for published calculator', async () => {
    const meta = await calculatorGenerateMetadata({ params: Promise.resolve({ slug: 'kredi' }) } as any);
    expect(meta.openGraph).toBeDefined();
    expect((meta.openGraph as any).url).toContain('https://www.hesapera.com.tr/');
    expect(meta.twitter).toBeDefined();
  });

  it('should block indexing for draft calculator', async () => {
    const meta = await calculatorGenerateMetadata({ params: Promise.resolve({ slug: 'adet-gunu' }) } as any);
    expect(meta.robots).toBeDefined();
    expect((meta.robots as any).index).toBe(false);
    expect((meta.robots as any).follow).toBe(false);
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContextualText } from '../contextual-link-parser';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';

// Mock CalculatorRegistry
vi.mock('@/calculators/core/calculator-registry', () => ({
  CalculatorRegistry: {
    getBySlug: vi.fn((slug: string) => {
      if (slug === 'valid-calc') return { status: 'published' };
      if (slug === 'draft-calc') return { status: 'draft' };
      return undefined;
    })
  }
}));

describe('ContextualText Parser', () => {
  it('renders normal text unchanged', () => {
    const { container } = render(<ContextualText text="Normal düz metin." />);
    expect(container.textContent).toBe('Normal düz metin.');
  });

  it('renders a single valid internal link', () => {
    const { container } = render(<ContextualText text="Buradan [geçerli link](/hesaplama/valid-calc) tıklayın." />);
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('geçerli link');
    expect(link.getAttribute('href')).toBe('/hesaplama/valid-calc');
    expect(container.textContent).toContain('Buradan');
    expect(container.textContent).toContain('tıklayın.');
  });

  it('renders multiple links correctly', () => {
    render(<ContextualText text="İlk [bir](/hesaplama/valid-calc) ve ikinci [iki](/hesaplama/valid-calc)." />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0].textContent).toBe('bir');
    expect(links[1].textContent).toBe('iki');
  });

  it('strips draft calculator links and returns plain text anchor', () => {
    const { container } = render(<ContextualText text="Bu bir [taslak araç](/hesaplama/draft-calc) linkidir." />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).toBe('Bu bir taslak araç linkidir.');
  });

  it('strips unknown calculator links', () => {
    const { container } = render(<ContextualText text="Bu bir [bilinmeyen](/hesaplama/unknown-calc) link." />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).toBe('Bu bir bilinmeyen link.');
  });

  it('strips external links', () => {
    const { container } = render(<ContextualText text="Google'a [git](https://google.com) veya [şuraya](http://test.com)." />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).toBe("Google'a git veya şuraya.");
  });

  it('preserves turkish characters in anchor text', () => {
    render(<ContextualText text="Lütfen [Türkçe ŞĞÜÖÇI](/hesaplama/valid-calc) testini yapın." />);
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('Türkçe ŞĞÜÖÇI');
  });

  it('prevents raw HTML injection', () => {
    const { container } = render(<ContextualText text="Zararlı <b>kalın</b> ve [XSS](javascript:alert(1)) test." />);
    // React escapes HTML inherently when rendering string nodes
    expect(container.innerHTML).toContain('&lt;b&gt;kalın&lt;/b&gt;');
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).toBe('Zararlı <b>kalın</b> ve XSS) test.');
  });
});

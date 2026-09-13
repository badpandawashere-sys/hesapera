import React from 'react';
import { render, screen } from '@testing-library/react';
import { GoogleAnalytics } from '../google-analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock next/script
vi.mock('next/script', () => {
  return {
    default: (props: any) => {
      if (props.dangerouslySetInnerHTML) {
        return <script data-testid={props.id} dangerouslySetInnerHTML={props.dangerouslySetInnerHTML} />;
      }
      return <script data-testid="ga-script" src={props.src} />;
    },
  };
});

describe('GoogleAnalytics', () => {
  let mockGtag: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGtag = vi.fn();
    (global as any).window = Object.create(window);
    (global as any).window.gtag = mockGtag;
  });

  it('1. should render script tags with send_page_view: false', () => {
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue(new URLSearchParams());
    
    render(<GoogleAnalytics />);
    
    const script = screen.getByTestId('google-analytics');
    expect(script.innerHTML).toContain('send_page_view: false');
  });

  it('2. should send exactly one page_view on initial mount', () => {
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue(new URLSearchParams());
    
    render(<GoogleAnalytics />);
    
    expect(mockGtag).toHaveBeenCalledTimes(1);
    expect(mockGtag).toHaveBeenCalledWith('config', 'G-D4N3E0JL7Q', {
      page_path: '/',
    });
  });

  it('3. should send exactly one page_view on route change', () => {
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue(new URLSearchParams());
    
    const { rerender } = render(<GoogleAnalytics />);
    expect(mockGtag).toHaveBeenCalledTimes(1);

    // Simulate route change
    (usePathname as any).mockReturnValue('/hesaplama/kredi');
    rerender(<GoogleAnalytics />);
    
    expect(mockGtag).toHaveBeenCalledTimes(2);
    expect(mockGtag).toHaveBeenLastCalledWith('config', 'G-D4N3E0JL7Q', {
      page_path: '/hesaplama/kredi',
    });
  });

  it('4. should send page_view when query params change', () => {
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue(new URLSearchParams());
    
    const { rerender } = render(<GoogleAnalytics />);
    
    // Simulate query param change
    (useSearchParams as any).mockReturnValue(new URLSearchParams('test=1'));
    rerender(<GoogleAnalytics />);
    
    expect(mockGtag).toHaveBeenCalledTimes(2);
    expect(mockGtag).toHaveBeenLastCalledWith('config', 'G-D4N3E0JL7Q', {
      page_path: '/?test=1',
    });
  });

  it('5. should not throw or crash if window or gtag is unavailable (SSR safe)', () => {
    (usePathname as any).mockReturnValue('/');
    (useSearchParams as any).mockReturnValue(new URLSearchParams());
    
    // Remove window.gtag
    delete (global as any).window.gtag;
    
    expect(() => render(<GoogleAnalytics />)).not.toThrow();
  });
});

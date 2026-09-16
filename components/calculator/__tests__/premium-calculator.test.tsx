import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  PremiumCalculatorResultPanel,
  PremiumCalculatorShell,
  PremiumCalculatorSubmit,
} from '../premium-calculator';

describe('premium calculator building blocks', () => {
  it('preserves the shared premium CTA dimensions and click behavior', () => {
    const onClick = vi.fn();
    render(<PremiumCalculatorSubmit onClick={onClick} />);

    const button = screen.getByRole('button', { name: /Hesapera\s*Hesapla/ });
    const logo = screen.getByRole('img', { name: 'Hesapera' });

    expect(button.className).toContain('!h-[64px]');
    expect(button.className).toContain('!text-[24px]');
    expect(button.className).toContain('shadow-xl');
    expect(button.className).toContain('[&>img]:!h-[42px]');
    expect(logo.parentElement?.parentElement?.className).toContain('max-w-[280px]');

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the CTA while loading and keeps optional footer actions available', () => {
    render(
      <PremiumCalculatorSubmit
        isLoading
        footer={<button type="button">Temizle</button>}
      />,
    );

    expect((screen.getByRole('button', { name: 'Hesapla' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('img', { name: 'Hesapera' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Temizle' })).toBeDefined();
  });

  it('renders the standard form/result grid and result panel states', () => {
    const { container } = render(
      <PremiumCalculatorShell
        isLoading
        form={<form aria-label="Form alanı" />}
        result={
          <PremiumCalculatorResultPanel state="empty">
            <p>Sonuç alanı</p>
          </PremiumCalculatorResultPanel>
        }
      />,
    );

    expect(screen.getByRole('form', { name: 'Form alanı' })).toBeDefined();
    expect(screen.getByText('Sonuç alanı')).toBeDefined();
    expect(container.querySelector('[aria-live="polite"]')?.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Sonuç alanı').parentElement?.className).toContain('min-h-[400px]');
  });
});

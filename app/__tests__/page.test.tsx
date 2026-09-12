import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Lucide icons to prevent SVG rendering issues in JSDOM if any
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="icon-search" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  Shield: () => <div data-testid="icon-shield" />,
  TrendingUp: () => <div data-testid="icon-trending" />,
  CreditCard: () => <div data-testid="icon-credit-card" />,
  Wallet: () => <div data-testid="icon-wallet" />,
  Receipt: () => <div data-testid="icon-receipt" />,
  Car: () => <div data-testid="icon-car" />,
  Building: () => <div data-testid="icon-building" />,
  GraduationCap: () => <div data-testid="icon-graduation" />,
  Heart: () => <div data-testid="icon-heart" />,
  Calculator: () => <div data-testid="icon-calculator" />,
  Clock: () => <div data-testid="icon-clock" />,
  Scale: () => <div data-testid="icon-scale" />,
  Plane: () => <div data-testid="icon-plane" />,
  WalletCards: () => <div data-testid="icon-wallet-cards" />,
  Percent: () => <div data-testid="icon-percent" />,
  CalendarDays: () => <div data-testid="icon-calendar-days" />,
  HeartPulse: () => <div data-testid="icon-heart-pulse" />,
  Banknote: () => <div data-testid="icon-banknote" />,
  Coffee: () => <div data-testid="icon-coffee" />,
}));

describe('Homepage', () => {
  it('1. should render the homepage hero section with search', () => {
    render(<HomePage />);
    expect(screen.getByText('Aradığın hesabı saniyeler içinde yap.')).toBeDefined();
    expect(screen.getByPlaceholderText(/Hesaplayıcı ara/i)).toBeDefined();
  });

  it('2. should render all 14 category cards', () => {
    render(<HomePage />);
    const categoryLinks = screen.getAllByRole('link', { name: /Tüm 14 Kategoriyi İncele/i });
    expect(categoryLinks.length).toBeGreaterThan(0);
    expect(screen.getByText('Finans')).toBeDefined();
    expect(screen.getByText('Matematik')).toBeDefined();
  });

  it('3. should render featured calculator cards', () => {
    render(<HomePage />);
    expect(screen.getByText('Konut Kredisi Hesaplama')).toBeDefined();
    expect(screen.getByText('Netten Brüte Maaş')).toBeDefined();
    expect(screen.getByText('Kıdem ve İhbar Tazminatı')).toBeDefined();
  });

  it('4. should render popular calculators section', () => {
    render(<HomePage />);
    expect(screen.getByText('Popüler Hesaplayıcılar')).toBeDefined();
    expect(screen.getByText('Yüzde Hesaplama')).toBeDefined();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

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
    expect(screen.getAllByText(/saniyeler/i).length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText(/ara/i).length).toBeGreaterThan(0);
  });

  it('2. should render all active category cards', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Finans/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Matematik/i).length).toBeGreaterThan(0);
  });

  it('3. should render featured calculator cards', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Kredi/i).length).toBeGreaterThan(0);
  });

  it('4. should render popular calculators section', () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Pop/i).length).toBeGreaterThan(0);
  });
});

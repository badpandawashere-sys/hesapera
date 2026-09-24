import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KarMarjiForm } from '../kar-marji-form';
import { calculateAction } from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));
vi.mock('@number-flow/react', () => ({
  default: ({ value }: any) => <span>{value}</span>
}));

const mockCalculator = {
  id: 'calc_kar_marji_001',
  slug: 'kar-marji-hesaplama',
  name: 'Kâr Marjı Hesaplama',
  description: '',
  category: 'finance',
  status: 'draft',
  metadata: { title: '', description: '', canonical: '', keywords: [], faq: [], relatedCalculators: [] }
} as any;

describe('KarMarjiForm Integration Test', () => {
  it('should format numbers and send calculate action', async () => {
    (calculateAction as any).mockResolvedValue({
      success: true,
      data: {
        primaryResult: 25,
        secondaryResults: {
          'Kâr Oranı': '%25',
          'Kâr Marjı': '%20',
          'Durum': 'Kâr'
        }
      }
    });

    render(<KarMarjiForm calculator={mockCalculator} />);
    
    const maliyetInput = screen.getAllByRole('textbox')[0];
    expect(maliyetInput).toBeDefined();
    
    fireEvent.change(maliyetInput, { target: { value: '1000' } });
    expect((maliyetInput as HTMLInputElement).value).toBe('1000');
    
    fireEvent.blur(maliyetInput);
    expect((maliyetInput as HTMLInputElement).value).toBe('1.000,00');
    
    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalled();
    });
  });
});

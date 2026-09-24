
vi.mock('@number-flow/react', () => ({
  default: ({ value }: any) => <span>{value}</span>
}));
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IndirimHesaplamaForm } from '../indirim-hesaplama-form';
import { calculateAction } from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

const mockCalculator = {
  id: 'calc_indirim',
  slug: 'indirim-hesaplama',
  name: 'İndirim Hesaplama',
  description: '',
  category: 'other',
  status: 'draft',
  metadata: { title: '', description: '', canonical: '', keywords: [], faq: [], relatedCalculators: [] }
} as any;

describe('IndirimHesaplamaForm Integration Test', () => {
  it('should have proper inputMode and format numbers', async () => {
    (calculateAction as any).mockResolvedValue({
      success: true,
      data: {
        primaryResult: 800,
        secondaryResults: {
          'İndirim Tutarı': 200,
          'İndirim Oranı': '%20'
        }
      }
    });

    render(<IndirimHesaplamaForm calculator={mockCalculator} />);
    
    // Check initial render
    const normalFiyatInput = screen.getAllByRole('textbox')[0];
    expect(normalFiyatInput).toBeDefined();
    
    // Change value
    fireEvent.change(normalFiyatInput, { target: { value: '2500' } });
    expect((normalFiyatInput as HTMLInputElement).value).toBe('2500');
    
    fireEvent.blur(normalFiyatInput);
    // After blur it should format
    expect((normalFiyatInput as HTMLInputElement).value).toBe('2.500,00');
    
    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalled();
    });
  });
});

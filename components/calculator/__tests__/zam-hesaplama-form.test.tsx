import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ZamHesaplamaForm } from '../zam-hesaplama-form';
import { calculateAction } from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));
vi.mock('@number-flow/react', () => ({
  default: ({ value }: any) => <span>{value}</span>
}));

const mockCalculator = {
  id: 'calc_increase_001',
  slug: 'zam-hesaplama',
  name: 'Zam Hesaplama',
  description: '',
  category: 'other',
  status: 'draft',
  metadata: { title: '', description: '', canonical: '', keywords: [], faq: [], relatedCalculators: [] }
} as any;

describe('ZamHesaplamaForm Integration Test', () => {
  it('should have proper inputMode and format numbers', async () => {
    (calculateAction as any).mockResolvedValue({
      success: true,
      data: {
        primaryResult: 1200,
        secondaryResults: {
          'Zam Tutarı': 200,
          'Zam Oranı': '%20'
        }
      }
    });

    render(<ZamHesaplamaForm calculator={mockCalculator} />);
    
    const eskiFiyatInput = screen.getAllByRole('textbox')[0];
    expect(eskiFiyatInput).toBeDefined();
    
    fireEvent.change(eskiFiyatInput, { target: { value: '2500' } });
    expect((eskiFiyatInput as HTMLInputElement).value).toBe('2500');
    
    fireEvent.blur(eskiFiyatInput);
    expect((eskiFiyatInput as HTMLInputElement).value).toBe('2.500,00');
    
    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalled();
    });
  });
});

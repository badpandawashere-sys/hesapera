import { render, screen, fireEvent, act } from '@testing-library/react';
import { LgsForm } from '../lgs-form';
import { calculateAction } from '@/app/actions/calculate';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

const mockCalculator = {
  id: 'calc_lgs_001',
  slug: 'lgs-puan',
  status: 'published' as const,
  name: 'LGS Puan Hesaplama',
  shortDescription: 'Desc',
  category: 'education',
  type: 'complex' as const,
  metadata: { title: 'Test', description: 'desc' },
  fields: [],
  schema: {} as any,
  calculate: vi.fn()
};

describe('LgsForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and does NOT call calculateAction on mount', () => {
    render(<LgsForm calculator={mockCalculator as any} />);
    expect(calculateAction).not.toHaveBeenCalled();
    
    // Empty state should be visible
    expect(screen.getByText(/LGS doğru ve yanlış sayılarını girerek/i)).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('can toggle muafiyet', () => {
    render(<LgsForm calculator={mockCalculator as any} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes).toHaveLength(2); // Din and Yabanci Dil

    const dinCheckbox = checkboxes[0];
    fireEvent.click(dinCheckbox);
    expect(dinCheckbox.checked).toBe(true);
  });

  it('submits correctly', async () => {
    (calculateAction as any).mockResolvedValue({
      success: true,
      data: {
        primaryResult: '55.00 Net',
        secondaryResults: {},
        notes: []
      }
    });

    render(<LgsForm calculator={mockCalculator as any} />);
    const btn = screen.getByRole('button', { name: /Hesapla/i });
    
    await act(async () => {
      fireEvent.click(btn);
    });

    expect(calculateAction).toHaveBeenCalledWith('lgs-puan', expect.objectContaining({
      dinMuaf: false,
      yabanciDilMuaf: false
    }));

    expect(screen.getByText('55.00 Net')).toBeTruthy();
  });
});

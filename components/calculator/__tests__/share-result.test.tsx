import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareResult } from '../share-result';
import { CalculatorResultData } from '@/calculators/core/calculator-result';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Share2: () => <div data-testid="share-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Check: () => <div data-testid="check-icon" />
}));

describe('ShareResult Component', () => {
  const mockData: CalculatorResultData<any, any> = {
    primaryLabel: 'Aylık Taksit',
    primaryResult: '10.000 TL',
    secondaryResults: {
      'Vade': '36 Ay',
      'Toplam': '360.000 TL'
    }
  };

  const expectedText = `Hesapera - Kredi Hesaplama\n\nAylık Taksit: 10.000 TL\n\nVade: 36 Ay\nToplam: 360.000 TL\n\nhttps://hesapera.com.tr/hesaplama/kredi`;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      share: undefined,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('should generate text from real values and fallback to clipboard if share not supported', async () => {
    render(<ShareResult calculatorName="Kredi Hesaplama" slug="kredi" data={mockData} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
    });
    
    // UI should show copied
    expect(screen.getByText('Kopyalandı')).toBeDefined();
  });

  it('should use navigator.share if supported', async () => {
    Object.assign(navigator, {
      share: vi.fn().mockResolvedValue(undefined)
    });

    render(<ShareResult calculatorName="Kredi Hesaplama" slug="kredi" data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Hesapera - Kredi Hesaplama',
        text: expectedText
      });
    });
  });

  it('should ignore AbortError (cancel share)', async () => {
    const error = new Error('AbortError');
    error.name = 'AbortError';
    Object.assign(navigator, {
      share: vi.fn().mockRejectedValue(error)
    });

    render(<ShareResult calculatorName="Kredi Hesaplama" slug="kredi" data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait and ensure no "Hata Oluştu" is shown
    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalled();
    });
    const errorText = screen.queryByText('Hata Oluştu');
    expect(errorText).toBeNull();
  });

  it('should show error message if share fails for other reasons', async () => {
    const error = new Error('UnknownError');
    Object.assign(navigator, {
      share: vi.fn().mockRejectedValue(error)
    });

    render(<ShareResult calculatorName="Kredi Hesaplama" slug="kredi" data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Hata Oluştu')).toBeDefined();
    });
  });
});

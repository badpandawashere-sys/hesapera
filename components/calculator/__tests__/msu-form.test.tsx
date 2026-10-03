import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MsuForm from '../msu-form';
import * as actions from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

describe('MsuForm', () => {
  it('renders inputs and calculates correctly', async () => {
    (actions.calculateAction as any).mockResolvedValue({
      success: true,
      data: {
        primaryResult: {
          nets: { turkce: 28, sosyal: 14, matematik: 23, fen: 11, total: 76 },
          isEligible: true,
          weightsInfo: {
            SAY: { turkce: 25, matematik: 35, fen: 30, sosyal: 10 },
            EA: { turkce: 35, matematik: 35, fen: 10, sosyal: 20 },
            SOZ: { turkce: 35, matematik: 20, fen: 10, sosyal: 35 },
            GENEL: { turkce: 33, matematik: 33, fen: 17, sosyal: 17 }
          }
        }
      }
    });

    render(<MsuForm calculator={{ slug: 'msu-puan' }} />);
    
    // Check initial state
    expect(screen.getByText('Doğru ve yanlış sayılarını girerek MSÜ netlerinizi hesaplayın.')).toBeDefined();
    
    // Click calculate
    const btn = screen.getByRole('button', { name: /Netleri Hesapla/i });
    fireEvent.click(btn);
    
    await waitFor(() => {
      expect(screen.getByText('MSÜ Net Sonucu')).toBeDefined();
      expect(screen.getByText('76.00')).toBeDefined();
      expect(screen.getByText('Puan Hesaplama Uygunluğu: Başarılı')).toBeDefined();
    });
  });
});

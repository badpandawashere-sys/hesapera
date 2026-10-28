import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalculatorTableCard } from '@/components/calculator/calculator-result';

describe('CalculatorTableCard Component', () => {
  it('should render table with <= 5 rows without expand button', () => {
    const mockResult = {
      success: true,
      data: {
        table: [
          { 'Taksit No': '1', 'Taksit Tutarı': '1.000 TL', 'Kalan Bakiye': '4.000 TL' },
          { 'Taksit No': '2', 'Taksit Tutarı': '1.000 TL', 'Kalan Bakiye': '3.000 TL' },
          { 'Taksit No': '3', 'Taksit Tutarı': '1.000 TL', 'Kalan Bakiye': '2.000 TL' }
        ]
      }
    };

    render(<CalculatorTableCard result={mockResult as any} />);

    expect(screen.getByText('Ödeme Planı Özeti')).toBeDefined();
    expect(screen.queryByText(/Tüm Ödeme Planını Gör/)).toBeNull();
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 data rows = 4 rows
    expect(rows.length).toBe(4);
  });

  it('should slice to 5 rows initially and expand/collapse when button is clicked', () => {
    const mockTable = Array.from({ length: 12 }, (_, i) => ({
      'Taksit No': `${i + 1}`,
      'Taksit Tutarı': '1.000 TL',
      'Kalan Bakiye': `${(12 - i) * 1000} TL`
    }));

    const mockResult = {
      success: true,
      data: {
        table: mockTable
      }
    };

    render(<CalculatorTableCard result={mockResult as any} />);

    // Initially shows first 5 rows (1 header + 5 data = 6 rows)
    let rows = screen.getAllByRole('row');
    expect(rows.length).toBe(6);

    const expandBtn = screen.getByRole('button', { name: /Tüm Ödeme Planını Gör \(12 Ay\)/i });
    expect(expandBtn).toBeDefined();

    // Click to expand
    fireEvent.click(expandBtn);

    // Now all 12 rows are shown (1 header + 12 data = 13 rows)
    rows = screen.getAllByRole('row');
    expect(rows.length).toBe(13);

    // Button text changes to collapse
    const collapseBtn = screen.getByRole('button', { name: /Daha Az Göster/i });
    expect(collapseBtn).toBeDefined();

    // Click to collapse
    fireEvent.click(collapseBtn);

    // Collapsed back to 5 rows (1 header + 5 data = 6 rows)
    rows = screen.getAllByRole('row');
    expect(rows.length).toBe(6);
  });
});

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YakitTuketimiForm } from '../yakit-tuketimi-form';
import { yakitTuketimiCalculatorDef } from '@/calculators/definitions/yakitTuketimi';
import { calculatorToViewModel } from '@/calculators/core/calculator-types';
import { CalculatorEngine } from '@/calculators/core/calculator-engine';
import { calculateAction } from '@/app/actions/calculate';
import '@/calculators/core/init';

vi.mock('@/app/actions/calculate', () => ({ calculateAction: vi.fn() }));

const action = vi.mocked(calculateAction);
const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /Hesapera\s*Hesapla/ }));

beforeEach(() => {
  action.mockReset();
  action.mockImplementation((slug, input) => CalculatorEngine.runBySlug(slug, input));
  render(<YakitTuketimiForm calculator={calculatorToViewModel(yakitTuketimiCalculatorDef)} />);
});

afterEach(cleanup);

describe('Yakıt tüketimi form', () => {
  it('submits mode A without a fuel price while the optional switch is off', async () => {
    expect(screen.queryByLabelText(/Yakıt Litre Fiyatı/)).toBeNull();
    fill(/Ödenen Yakıt Tutarı/, '543');
    fill(/Gidilen Mesafe/, '142');
    submit();

    await waitFor(() => expect(action).toHaveBeenCalledWith('yakit-tuketimi', {
      mod: 'A', paidAmount: 543, distance: 142,
    }));
    expect((await screen.findAllByText('3,82 TL / km')).length).toBeGreaterThan(0);
    expect(screen.queryByText('İlgili Hesaplamalar')).toBeNull();
  });

  it('includes a decimal fuel price only while its switch is on and clears stale values when turned off', async () => {
    const fuelSwitch = screen.getByRole('checkbox', { name: /Yakıt litre fiyatını da biliyorum/ });
    fireEvent.click(fuelSwitch);
    fill(/Ödenen Yakıt Tutarı/, '543');
    fill(/Gidilen Mesafe/, '142');
    fill(/Yakıt Litre Fiyatı/, '45,50');
    submit();

    await screen.findAllByText('8,40 L / 100 km');
    expect(action).toHaveBeenLastCalledWith('yakit-tuketimi', {
      mod: 'A', paidAmount: 543, distance: 142, fuelPrice: 45.5,
    });

    fireEvent.click(fuelSwitch);
    expect(screen.queryByLabelText(/Yakıt Litre Fiyatı/)).toBeNull();
    expect(screen.queryByText('8,40 L / 100 km')).toBeNull();
    fireEvent.click(fuelSwitch);
    expect((screen.getByLabelText(/Yakıt Litre Fiyatı/) as HTMLInputElement).value).toBe('');
    fireEvent.click(fuelSwitch);
    submit();
    await waitFor(() => expect(action).toHaveBeenLastCalledWith('yakit-tuketimi', {
      mod: 'A', paidAmount: 543, distance: 142,
    }));
  });

  it('switches between B and C without leaking fields or results', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Bu bütçeyle kaç km giderim/ }));
    expect(screen.queryByLabelText(/Yakıt Litre Fiyatı/)).toBeNull();
    expect(screen.queryByText(/Ortalama Tüketim/)).toBeNull();
    fill(/Toplam Bütçe/, '1200');
    fill(/Km Başına Maliyet/, '3,2');
    submit();

    await screen.findAllByText('375,00 km');
    expect(action).toHaveBeenLastCalledWith('yakit-tuketimi', { mod: 'B', budget: 1200, costPerKm: 3.2 });

    fireEvent.click(screen.getByRole('button', { name: /Bu mesafe kaça mal olur/ }));
    expect(screen.queryByText('375,00 km')).toBeNull();
    expect(screen.queryByLabelText(/Toplam Bütçe/)).toBeNull();
    expect((screen.getByLabelText(/Gidilecek Mesafe/) as HTMLInputElement).value).toBe('');
    fill(/Gidilecek Mesafe/, '142,5');
    fill(/Km Başına Maliyet/, '3,2');
    submit();

    await screen.findAllByText('456,00 TL');
    expect(action).toHaveBeenLastCalledWith('yakit-tuketimi', { mod: 'C', distance: 142.5, costPerKm: 3.2 });
  });

  it('shows Zod field errors and clears a previous result when inputs change', async () => {
    fill(/Ödenen Yakıt Tutarı/, '543');
    fill(/Gidilen Mesafe/, '142');
    submit();
    await screen.findAllByText('3,82 TL / km');

    const fuelSwitch = screen.getByRole('checkbox', { name: /Yakıt litre fiyatını da biliyorum/ });
    fireEvent.click(fuelSwitch);
    fill(/Yakıt Litre Fiyatı/, '0');
    expect(screen.queryByText('3,82 TL / km')).toBeNull();
    submit();
    await screen.findByText("Değer 0'dan büyük olmalıdır.");
    expect(screen.getByLabelText(/Yakıt Litre Fiyatı/).getAttribute('aria-invalid')).toBe('true');

    fill(/Ödenen Yakıt Tutarı/, '100001');
    fireEvent.click(fuelSwitch);
    submit();
    await screen.findByText('En fazla 100000 girilebilir.');
  });

  it('ignores an old response after a mode switch and reset clears active fields', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof calculateAction>>) => void;
    action.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    fill(/Ödenen Yakıt Tutarı/, '543');
    fill(/Gidilen Mesafe/, '142');
    submit();
    fireEvent.click(screen.getByRole('button', { name: /Bu bütçeyle kaç km giderim/ }));

    await act(async () => resolve({ success: true, data: { primaryResult: 'STALE RESULT' } }));
    expect(screen.queryByText('STALE RESULT')).toBeNull();
    fill(/Toplam Bütçe/, '1200');
    fireEvent.click(screen.getByRole('button', { name: /Temizle/ }));
    expect((screen.getByLabelText(/Toplam Bütçe/) as HTMLInputElement).value).toBe('');
  });

  it('reports action failures and releases the loading state', async () => {
    action.mockRejectedValueOnce(new Error('offline'));
    submit();
    expect((await screen.findByRole('alert')).textContent).toContain('bağlantı hatası');
    expect((screen.getByRole('button', { name: /Hesapera\s*Hesapla/ }) as HTMLButtonElement).disabled).toBe(false);
  });
});

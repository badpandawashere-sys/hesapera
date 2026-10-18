import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MtvForm } from '../mtv-form';
import { mtvCalculatorDef } from '@/calculators/definitions/mtv';
import { calculatorToViewModel } from '@/calculators/core/calculator-types';
import { CalculatorEngine } from '@/calculators/core/calculator-engine';
import { calculateAction } from '@/app/actions/calculate';
import '@/calculators/core/init';

vi.mock('@/app/actions/calculate', () => ({ calculateAction: vi.fn() }));

const action = vi.mocked(calculateAction);
const submit = () => fireEvent.click(screen.getByRole('button', { name: /Hesapera\s*Hesapla/i }));

beforeEach(() => {
  action.mockReset();
  action.mockImplementation((slug, input) => CalculatorEngine.runBySlug(slug, input));
});

afterEach(cleanup);

describe('MTV Form Component (MtvForm)', () => {
  it('1. grupları (Araç Bilgileri ve Tescil/Değer Bilgileri) ve başlangıç değerlerini doğru render eder', () => {
    render(<MtvForm calculator={calculatorToViewModel(mtvCalculatorDef)} />);

    // Grup başlıkları
    expect(screen.getByRole('heading', { name: /Araç Bilgileri/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /Tescil ve Değer Bilgileri/i })).toBeDefined();

    // Model yılı ve ilk tescil yılı noktasız 2023 formatında olmalı
    const modelYearInput = screen.getByLabelText(/Model Yılı/i) as HTMLInputElement;
    const firstRegYearInput = screen.getByLabelText(/İlk Tescil Yılı/i) as HTMLInputElement;
    expect(modelYearInput.value).toBe('2023');
    expect(firstRegYearInput.value).toBe('2023');
    expect(modelYearInput.value).not.toContain('.');

    // Motor hacmi Türkçe binlik ayracı ile 1.600 olarak render edilmeli
    const engineCcInput = screen.getByLabelText(/Motor Hacmi/i) as HTMLInputElement;
    expect(engineCcInput.value).toBe('1.600');

    // Başlangıçta boş durum paneli görünmeli
    expect(screen.getByText(/2026 MTV Tutarını Hesaplayın/i)).toBeDefined();
  });

  it('2. 2.000 motor hacmi geçerliliğini ve model/tescil yılı 2023 biçimini koruyarak hesaplama yapar', async () => {
    render(<MtvForm calculator={calculatorToViewModel(mtvCalculatorDef)} />);

    const engineCcInput = screen.getByLabelText(/Motor Hacmi/i);
    fireEvent.change(engineCcInput, { target: { value: '2000' } });

    // Formatlı görüntüde 2.000 görünmeli
    expect((engineCcInput as HTMLInputElement).value).toBe('2.000');

    submit();

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith('mtv-hesaplama', expect.objectContaining({
        modelYear: 2023,
        firstRegistrationYear: 2023,
        vehicleType: 'combustion',
        engineCc: 2000,
        vehicleValue: 500000,
      }));
    });

    // 2023 model, 2.0L, 500.000 TL -> 2026 yılı 4-6 yaş grubu 1.801-2.000 cc tarifesi: 23.625,00 TL
    expect((await screen.findAllByText(/23\.625,00/)).length).toBeGreaterThan(0);
    // İki taksit: 11.812,50 TL
    expect((await screen.findAllByText(/11\.812,50/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/1\. Taksit \(Ocak\)/i)).toBeDefined();
    expect(screen.getByText(/2\. Taksit \(Temmuz\)/i)).toBeDefined();
  });

  it('3. elektrikli araç seçildiğinde motor hacmi gizlenir, kW gücü gönderilir ve indirim rozeti gösterilir', async () => {
    render(<MtvForm calculator={calculatorToViewModel(mtvCalculatorDef)} />);

    // Motor türünü elektrikli yap (select tetikleyici üzerinden veya doğrudan state tetikleme simülasyonu)
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    
    // SelectItem seçimi
    const electricOption = await screen.findByText('Sadece elektrik motoru');
    fireEvent.pointerDown(electricOption);
    fireEvent.click(electricOption);

    // Motor hacmi gizlenmeli, Elektrik motor gücü görünmeli
    expect(screen.queryByLabelText(/Motor Hacmi/i)).toBeNull();
    const kwInput = screen.getByLabelText(/Elektrik Motor Gücü/i) as HTMLInputElement;
    expect(kwInput.value).toBe('85');

    submit();

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith('mtv-hesaplama', expect.objectContaining({
        vehicleType: 'electric',
        motorPowerKw: 85,
      }));
      expect(action).not.toHaveBeenCalledWith('mtv-hesaplama', expect.objectContaining({
        engineCc: expect.anything(),
      }));
    });

    // Elektrikli araç rozeti görünmeli
    expect(await screen.findByText(/Elektrikli Araç Teşviki/i)).toBeDefined();
  });

  it('4. kasko değeri girilip kasko indirimi şartı oluştuğunda kasko indirim rozeti görünür', async () => {
    render(<MtvForm calculator={calculatorToViewModel(mtvCalculatorDef)} />);

    // 2023 model, 1600 cc standart araçta kasko değerini düşük girerek indirimi tetikleyelim
    const cascoInput = screen.getByLabelText(/Kasko Değeri/i);
    fireEvent.change(cascoInput, { target: { value: '50000' } });

    submit();

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith('mtv-hesaplama', expect.objectContaining({
        cascoValue: 50000,
      }));
    });

    expect(await screen.findByText(/Kasko İndirimi Uygulandı/i)).toBeDefined();
  });

  it('5. geçersiz girişlerde (ör. tescil yılı model yılından önce) açık doğrulama hatası gösterir', async () => {
    render(<MtvForm calculator={calculatorToViewModel(mtvCalculatorDef)} />);

    const firstRegYearInput = screen.getByLabelText(/İlk Tescil Yılı/i);
    fireEvent.change(firstRegYearInput, { target: { value: '2020' } });

    submit();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/İlk tescil yılı model yılından önce olamaz/i)).toBeDefined();
    });
  });

  it('6. Formu Temizle butonu formu sıfırlar ve sonuç panelini boş duruma döndürür', async () => {
    render(<MtvForm calculator={calculatorToViewModel(mtvCalculatorDef)} />);

    submit();
    expect(await screen.findByText(/Yıllık Toplam/i)).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /Formu Temizle/i });
    fireEvent.click(resetButton);

    expect(screen.queryByText(/Yıllık Toplam/i)).toBeNull();
    expect(screen.getByText(/2026 MTV Tutarını Hesaplayın/i)).toBeDefined();
  });
});

'use client';

import React, { useState, useEffect, useId } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { ShareResult } from './share-result';
import { 
  Building2, 
  Briefcase, 
  UserCheck, 
  Scale, 
  ChevronDown, 
  Info, 
  ShieldAlert, 
  FileSpreadsheet, 
  Check,
  ReceiptText
} from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface WorkplaceLoanFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .wp-loan-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .wp-loan-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .wp-loan-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .wp-loan-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .wp-loan-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
  }
`;

type CustomerType = 'commercial' | 'individual' | 'exempt';

export function WorkplaceLoanForm({ calculator }: WorkplaceLoanFormProps) {
  // Numeric input state
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(3.50);
  const [term, setTerm] = useState<number>(60);
  const [customerType, setCustomerType] = useState<CustomerType>('commercial');

  // Formatted string state for inputs
  const [loanAmountStr, setLoanAmountStr] = useState<string>('1.000.000');
  const [interestRateStr, setInterestRateStr] = useState<string>('3,50');
  const [termStr, setTermStr] = useState<string>('60');

  // Calculation state
  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Quick preset amounts
  const loanPresets = [
    { label: '500 Bin TL', value: 500000 },
    { label: '1 Milyon TL', value: 1000000 },
    { label: '2.5 Milyon TL', value: 2500000 },
    { label: '5 Milyon TL', value: 5000000 },
    { label: '10 Milyon TL', value: 10000000 },
  ];

  // Quick preset terms
  const termPresets = [
    { label: '36 Ay (3 Yıl)', value: 36 },
    { label: '60 Ay (5 Yıl)', value: 60 },
    { label: '84 Ay (7 Yıl)', value: 84 },
    { label: '120 Ay (10 Yıl)', value: 120 },
  ];

  const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(num);

  const performCalculation = async (
    amountVal: number,
    rateVal: number,
    termVal: number,
    typeVal: CustomerType
  ) => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        loanAmount: amountVal,
        monthlyInterestRate: rateVal,
        termMonths: termVal,
        customerType: typeVal
      });
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error('İş yeri kredisi hesaplama hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    setIsMounted(true);
    performCalculation(loanAmount, interestRate, term, customerType);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers for Loan Amount
  const handleLoanAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      setLoanAmountStr('');
      setLoanAmount(0);
      return;
    }
    const num = parseInt(raw, 10);
    setLoanAmount(num);
    setLoanAmountStr(formatThousands(num));
  };

  const handleLoanAmountSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setLoanAmount(num);
    setLoanAmountStr(formatThousands(num));
  };

  const handleLoanPresetClick = (presetValue: number) => {
    setLoanAmount(presetValue);
    setLoanAmountStr(formatThousands(presetValue));
    performCalculation(presetValue, interestRate, term, customerType);
  };

  // Handlers for Interest Rate
  const handleInterestRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9,.]/g, '').replace('.', ',');
    setInterestRateStr(raw);
    const normalized = raw.replace(',', '.');
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      setInterestRate(num);
    }
  };

  const handleInterestRateSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    setInterestRate(num);
    setInterestRateStr(num.toFixed(2).replace('.', ','));
  };

  // Handlers for Term
  const handleTermInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setTermStr(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      setTerm(num);
    }
  };

  const handleTermSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setTerm(num);
    setTermStr(String(num));
  };

  const handleTermPresetClick = (presetValue: number) => {
    setTerm(presetValue);
    setTermStr(String(presetValue));
    performCalculation(loanAmount, interestRate, presetValue, customerType);
  };

  // Handler for Customer Type
  const handleCustomerTypeChange = (newType: CustomerType) => {
    setCustomerType(newType);
    performCalculation(loanAmount, interestRate, term, newType);
  };

  // Trigger manual calculation
  const handleManualCalculate = () => {
    performCalculation(loanAmount, interestRate, term, customerType);
  };

  // Computed display values
  const rawValues = (result?.data as any)?.rawValues;
  const monthlyPayment = rawValues?.monthlyPayment ?? 0;
  const totalPayment = rawValues?.totalPayment ?? 0;
  const totalInterest = rawValues?.totalInterest ?? 0;
  const totalBSMV = rawValues?.totalBSMV ?? 0;
  const totalKKDF = rawValues?.totalKKDF ?? 0;
  const totalTax = totalBSMV + totalKKDF;

  // Percentage shares for cost bar
  const totalPaymentSafe = totalPayment > 0 ? totalPayment : 1;
  const principalPercent = Math.min(100, Math.max(0, (loanAmount / totalPaymentSafe) * 100));
  const interestPercent = Math.min(100, Math.max(0, (totalInterest / totalPaymentSafe) * 100));
  const taxPercent = Math.min(100, Math.max(0, (totalTax / totalPaymentSafe) * 100));

  const tableData = result?.data?.table || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />

      {/* --- ANA FORM VE SONUÇ KART KAPSAYICISI --- */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* SOL BÖLÜM: FORM KONTROLLERİ (7 KOLON) */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-violet-600" />
                İş Yeri Kredisi Parametreleri
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Dükkan, ofis veya iş yeri finansmanında kredi tutarını, vadesini ve geçerli vergi rejimini seçerek net maliyeti hesaplayın.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* 1. KREDİ TUTARI */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    Kredi Tutarı
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={loanAmountStr}
                      onChange={handleLoanAmountInputChange}
                      onBlur={handleManualCalculate}
                      className="w-44 px-4 py-2 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs pointer-events-none">TL</span>
                  </div>
                </div>

                <input 
                  type="range"
                  min={50000}
                  max={20000000}
                  step={50000}
                  value={Math.min(Math.max(loanAmount, 50000), 20000000)}
                  onChange={handleLoanAmountSliderChange}
                  onMouseUp={handleManualCalculate}
                  onTouchEnd={handleManualCalculate}
                  className="wp-loan-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${Math.min(100, Math.max(0, ((loanAmount - 50000) / (20000000 - 50000)) * 100))}%, #E2E8F0 ${Math.min(100, Math.max(0, ((loanAmount - 50000) / (20000000 - 50000)) * 100))}%, #E2E8F0 100%)`
                  }}
                  aria-label="Kredi Tutarı Kaydırıcı"
                />

                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>50 Bin TL</span>
                  <span>20 Milyon TL</span>
                </div>

                {/* Hızlı Çipler */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {loanPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleLoanPresetClick(preset.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        loanAmount === preset.value
                          ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. AYLIK FAİZ ORANI */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Aylık Faiz Oranı (%)</label>
                    <p className="text-xs text-slate-400">Bankanın sunduğu aylık brüt akdi faiz</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="decimal"
                      value={interestRateStr}
                      onChange={handleInterestRateInputChange}
                      onBlur={handleManualCalculate}
                      className="w-32 px-4 py-2 pr-8 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs pointer-events-none">%</span>
                  </div>
                </div>

                <input 
                  type="range"
                  min={0.10}
                  max={10.00}
                  step={0.01}
                  value={interestRate}
                  onChange={handleInterestRateSliderChange}
                  onMouseUp={handleManualCalculate}
                  onTouchEnd={handleManualCalculate}
                  className="wp-loan-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${((interestRate - 0.10) / (10.00 - 0.10)) * 100}%, #E2E8F0 ${((interestRate - 0.10) / (10.00 - 0.10)) * 100}%, #E2E8F0 100%)`
                  }}
                  aria-label="Aylık Faiz Oranı Kaydırıcı"
                />

                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>%0.10</span>
                  <span>%10.00</span>
                </div>
              </div>

              {/* 3. VADE (AY) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Geri Ödeme Vadesi</label>
                    <p className="text-xs text-slate-400">Piyasa teamülü genellikle azami 120 aydır</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={termStr}
                      onChange={handleTermInputChange}
                      onBlur={handleManualCalculate}
                      className="w-32 px-4 py-2 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs pointer-events-none">Ay</span>
                  </div>
                </div>

                <input 
                  type="range"
                  min={1}
                  max={120}
                  step={1}
                  value={term}
                  onChange={handleTermSliderChange}
                  onMouseUp={handleManualCalculate}
                  onTouchEnd={handleManualCalculate}
                  className="wp-loan-slider"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${((term - 1) / (120 - 1)) * 100}%, #E2E8F0 ${((term - 1) / (120 - 1)) * 100}%, #E2E8F0 100%)`
                  }}
                  aria-label="Vade Kaydırıcı"
                />

                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>1 Ay</span>
                  <span>120 Ay (10 Yıl)</span>
                </div>

                {/* Hızlı Vade Çipleri */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {termPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleTermPresetClick(preset.value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        term === preset.value
                          ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. KREDİ / VERGİ REJİMİ (INTERAKTİF KART SEÇİCİ) */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                  <span>Kredi / Vergi Rejimi</span>
                  <span className="text-xs font-normal text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">6802 Sayılı GVK Uyarınca</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Ticari Kart */}
                  <button
                    type="button"
                    onClick={() => handleCustomerTypeChange('commercial')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                      customerType === 'commercial'
                        ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Briefcase className={`w-4 h-4 ${customerType === 'commercial' ? 'text-violet-600' : 'text-slate-500'}`} />
                        {customerType === 'commercial' && (
                          <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs md:text-sm text-slate-800 leading-tight">Ticari İşletme</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Vergi levhalı şirketler & KOBİ&apos;ler</div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        %5 BSMV • %0 KKDF
                      </span>
                    </div>
                  </button>

                  {/* Bireysel Kart */}
                  <button
                    type="button"
                    onClick={() => handleCustomerTypeChange('individual')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                      customerType === 'individual'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <UserCheck className={`w-4 h-4 ${customerType === 'individual' ? 'text-amber-600' : 'text-slate-500'}`} />
                        {customerType === 'individual' && (
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs md:text-sm text-slate-800 leading-tight">Bireysel Yatırımcı</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Şahsi dükkan/ofis yatırımı</div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        %15 BSMV • %15 KKDF
                      </span>
                    </div>
                  </button>

                  {/* Vergisiz Simülasyon Kartı */}
                  <button
                    type="button"
                    onClick={() => handleCustomerTypeChange('exempt')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                      customerType === 'exempt'
                        ? 'border-slate-700 bg-slate-100/70 ring-2 ring-slate-400/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Scale className={`w-4 h-4 ${customerType === 'exempt' ? 'text-slate-800' : 'text-slate-500'}`} />
                        {customerType === 'exempt' && (
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs md:text-sm text-slate-800 leading-tight">Vergisiz Simülasyon</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Brüt faiz analitik modu</div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                        %0 Vergi (Yalın)
                      </span>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* HESAPLA BUTONU */}
            <div className="w-full flex justify-center pt-2">
              <div className="w-full max-w-[280px]">
                <CalculatorSubmitButton 
                  onClick={handleManualCalculate} 
                  isLoading={isLoading} 
                  className="!h-[60px] !text-[22px] [&>img]:!h-[40px] shadow-xl hover:shadow-2xl" 
                />
              </div>
            </div>
          </div>

          {/* SAĞ BÖLÜM: PREMIUM SONUÇ VE MALİYET KARTI (5 KOLON) */}
          <div className="lg:col-span-5 bg-[#F5F3FF] rounded-[2rem] p-6 md:p-8 relative overflow-hidden flex flex-col h-full border border-[#EDE9FE]">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col space-y-6">

              {/* 1. KAHRAMAN ALAN (HERO): AYLIK TAKSİT TUTARI */}
              <div className="border-b border-violet-200/60 pb-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-violet-700 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                    <ReceiptText className="w-4 h-4 text-violet-600" />
                    Aylık Taksit Tutarı
                  </span>
                  
                  {/* Aktif Rejim Rozeti */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    customerType === 'commercial'
                      ? 'bg-emerald-100 text-emerald-800'
                      : customerType === 'individual'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {customerType === 'commercial' ? 'Ticari Rejim' : customerType === 'individual' ? 'Bireysel Rejim' : 'Vergisiz Mod'}
                  </span>
                </div>

                <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-baseline">
                  {isMounted ? (
                    <NumberFlow 
                      value={monthlyPayment}
                      format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatCurrency(monthlyPayment)}</span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <span>Kredi: <strong className="text-slate-700">{formatCurrency(loanAmount)}</strong></span>
                  <span>•</span>
                  <span>Faiz: <strong className="text-slate-700">%{interestRate.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Vade: <strong className="text-slate-700">{term} Ay</strong></span>
                </div>
              </div>

              {/* 2. MALİYET BİLEŞENLERİ DAĞILIM BARI */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/70 shadow-xs space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Geri Ödeme Bileşenleri</span>
                  <span className="text-slate-500 font-medium">{formatCurrency(totalPayment)}</span>
                </div>

                {/* 3'lü Segmentli Bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${principalPercent}%` }} 
                    className="bg-violet-600 h-full transition-all duration-500" 
                    title={`Anapara: %${principalPercent.toFixed(1)}`}
                  />
                  <div 
                    style={{ width: `${interestPercent}%` }} 
                    className="bg-violet-300 h-full transition-all duration-500" 
                    title={`Toplam Faiz: %${interestPercent.toFixed(1)}`}
                  />
                  <div 
                    style={{ width: `${taxPercent}%` }} 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    title={`Yasal Vergiler: %${taxPercent.toFixed(1)}`}
                  />
                </div>

                {/* Bar Lejantı */}
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shrink-0" />
                    <span className="text-slate-600 truncate">Anapara (%{principalPercent.toFixed(0)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-300 shrink-0" />
                    <span className="text-slate-600 truncate">Faiz (%{interestPercent.toFixed(0)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-600 truncate">Vergi (%{taxPercent.toFixed(0)})</span>
                  </div>
                </div>
              </div>

              {/* 3. ÖZET MAKRO METRİKLER (HİZALI VE NET DÖKÜM) */}
              <div className="space-y-2.5 bg-white/70 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/80 shadow-xs">
                {/* Toplam Geri Ödeme (Vurgulu) */}
                <div className="flex justify-between items-center pb-2.5 border-b border-violet-100/70">
                  <span className="text-sm font-semibold text-slate-700">Toplam Geri Ödeme</span>
                  <span className="text-base md:text-lg font-black text-slate-900">
                    {formatCurrency(totalPayment)}
                  </span>
                </div>

                {/* Toplam Faiz */}
                <div className="flex justify-between items-center py-1.5 border-b border-violet-100/50 text-sm">
                  <span className="text-slate-600 font-medium">Toplam Net Faiz</span>
                  <span className="font-bold text-slate-800">{formatCurrency(totalInterest)}</span>
                </div>

                {/* Toplam Vergi (BSMV & KKDF) */}
                <div className="flex justify-between items-center py-1.5 border-b border-violet-100/50 text-sm">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    Toplam Yasal Vergi
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-semibold">
                      BSMV + KKDF
                    </span>
                  </span>
                  <span className="font-bold text-amber-700">{formatCurrency(totalTax)}</span>
                </div>

                {/* Vergi Detay Kırılımı (BSMV / KKDF) */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-500">
                  <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Toplam BSMV</span>
                    <span className="font-bold text-slate-700">{formatCurrency(totalBSMV)}</span>
                  </div>
                  <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Toplam KKDF</span>
                    <span className="font-bold text-slate-700">
                      {totalKKDF > 0 ? formatCurrency(totalKKDF) : '₺0,00 (Muaf)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. YASAL VE MASRAF BİLGİLENDİRME KUTUSU */}
              <div className="mt-auto bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 p-4 rounded-2xl text-blue-900 text-xs leading-relaxed space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  Mevzuat & Masraf Bilgilendirmesi
                </div>
                <p className="opacity-90">
                  6802 sayılı GVK uyarınca ticari kredilerde %5 BSMV uygulanmakta, KKDF sıfırdır. Tüketici yatırım kredilerinde ise %15 BSMV + %15 KKDF tahakkuk eder.
                </p>
                <p className="text-[11px] text-blue-800/80 pt-1 border-t border-blue-100">
                  <strong>Harici Masraflar:</strong> TCMB 2020/4 Tebliği kapsamındaki kredi tahsis/kullandırım ücreti, gayrimenkul ekspertiz raporu bedeli, tapu ipotek harçları ve zorunlu sigortalar taksit tutarına dahil değildir.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- AMORTİSMAN TABLOSU (ÖDEME PLANI AKORDEONU) --- */}
      {tableData.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <button 
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-base md:text-lg block">
                  Ödeme Planı (Amortisman Tablosu — {term} Ay)
                </span>
                <span className="text-xs text-slate-500">
                  Aylık anapara, faiz, BSMV ve KKDF tahakkuk detayları
                </span>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${showTable ? 'rotate-180' : ''}`} />
          </button>

          {showTable && (
            <div className="p-4 md:p-6 border-t border-slate-100">
              <div className="overflow-x-auto relative rounded-xl border border-slate-100">
                <table className="w-full text-xs md:text-sm text-left">
                  <thead className="text-[11px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3.5 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.03)] whitespace-nowrap">
                        Taksit No
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Taksit Tutarı</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Anapara</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Faiz</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">BSMV</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">KKDF</th>
                      <th className="px-4 py-3.5 whitespace-nowrap text-right">Kalan Borç</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(isTableExpanded ? tableData : tableData.slice(0, 12)).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-violet-50/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800 sticky left-0 bg-white z-10 shadow-[2px_0_4px_rgba(0,0,0,0.03)] whitespace-nowrap">
                          {row['Taksit No']}. Ay
                        </td>
                        <td className="px-4 py-3 font-bold text-violet-700 whitespace-nowrap">
                          {row['Taksit Tutarı']}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {row['Anapara']}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {row['Faiz']}
                        </td>
                        <td className="px-4 py-3 text-amber-700 whitespace-nowrap text-xs">
                          {row['BSMV']}
                        </td>
                        <td className="px-4 py-3 text-amber-700 whitespace-nowrap text-xs">
                          {row['KKDF']}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {row['Kalan Bakiye']}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tableData.length > 12 && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsTableExpanded(!isTableExpanded)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs transition-colors shadow-xs"
                  >
                    {isTableExpanded ? 'İlk 12 Ayı Göster (Daralt)' : `Tüm Ödeme Planını Gör (${tableData.length} Ay)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- PAYLAŞ BUTONU --- */}
      {result?.data && (
        <div className="pt-2">
          <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />
        </div>
      )}
    </div>
  );
}

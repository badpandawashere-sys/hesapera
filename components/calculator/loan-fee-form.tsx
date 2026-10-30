'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import {
  calculateLoanFee,
  calculateDaysBetween,
  calculateCommercialLimitCeilingRate,
  calculateCommercialUsageCeilingRate,
  LoanType,
  CommercialLoanKind,
  ExpenseDeductionMode,
} from '@/calculators/formulas/loanFee';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { ShareResult } from './share-result';
import NumberFlow from '@number-flow/react';
import {
  Coins,
  Home,
  Car,
  Briefcase,
  Check,
  Info,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  Wallet,
  Receipt,
  Percent,
  Calendar,
  Layers,
} from 'lucide-react';

interface LoanFeeFormProps {
  calculator: CalculatorViewModel;
}

type InputMode = 'rate' | 'amount';
type VadeMode = 'days' | 'dates';

const sliderStyles = `
  .loan-fee-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .loan-fee-slider::-webkit-slider-thumb {
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
  .loan-fee-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .loan-fee-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #7C3AED;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    transition: transform 0.1s;
  }
  .loan-fee-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
  }
`;

export function LoanFeeForm({ calculator }: LoanFeeFormProps) {
  // 1. Kredi Türü
  const [loanType, setLoanType] = useState<LoanType>('ihtiyac');

  // 2. Kredi Tutarı (Fiilen Kullandırılan Nakit Matrahı)
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanAmountStr, setLoanAmountStr] = useState<string>('100.000');

  // 3. Konut Kredisi 7491 Sayılı Kanun (28.12.2023) Kuralı:
  // Üzerine kayıtlı konut var mı?
  const [hasExistingHome, setHasExistingHome] = useState<boolean>(false);

  // 4. Bireysel / Tüketici Kredisi Masraf Giriş Modu
  const [inputMode, setInputMode] = useState<InputMode>('rate');
  const [feeRate, setFeeRate] = useState<number>(0.50);
  const [feeRateStr, setFeeRateStr] = useState<string>('0,50');
  const [customFeeAmount, setCustomFeeAmount] = useState<number>(500);
  const [customFeeAmountStr, setCustomFeeAmountStr] = useState<string>('500');

  // 5. Ticari Kredi TCMB 2020/4 Madde 9 Parametreleri
  const [commercialKind, setCommercialKind] = useState<CommercialLoanKind>('taksitli_tl');
  const [commercialLimitAmount, setCommercialLimitAmount] = useState<number>(100000);
  const [commercialLimitAmountStr, setCommercialLimitAmountStr] = useState<string>('100.000');
  const [commercialLimitMonths, setCommercialLimitMonths] = useState<number>(12);

  // Kredi Kullandırım Vadesi (Gün / Tarih seçimi)
  const [vadeInputMode, setVadeInputMode] = useState<VadeMode>('days');
  const [termDays, setTermDays] = useState<number>(360);
  const [termDaysStr, setTermDaysStr] = useState<string>('360');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-06-30'); // 180 gün

  const [rotatifAverageBalance, setRotatifAverageBalance] = useState<number>(100000);
  const [rotatifAverageBalanceStr, setRotatifAverageBalanceStr] = useState<string>('100.000');

  // Ticari oranlar
  const [commercialLimitFeeRate, setCommercialLimitFeeRate] = useState<number>(0.20);
  const [commercialLimitFeeRateStr, setCommercialLimitFeeRateStr] = useState<string>('0,20');
  const [commercialUsageFeeRate, setCommercialUsageFeeRate] = useState<number>(1.10);
  const [commercialUsageFeeRateStr, setCommercialUsageFeeRateStr] = useState<string>('1,10');

  // 6. Üçüncü Taraf Belgelenmiş Masraflar
  const [valuationFee, setValuationFee] = useState<number>(0);
  const [valuationFeeStr, setValuationFeeStr] = useState<string>('0');
  const [mortgageFee, setMortgageFee] = useState<number>(0);
  const [mortgageFeeStr, setMortgageFeeStr] = useState<string>('0');
  const [insuranceFee, setInsuranceFee] = useState<number>(0);
  const [insuranceFeeStr, setInsuranceFeeStr] = useState<string>('0');
  const [otherExpenses, setOtherExpenses] = useState<number>(0);
  const [otherExpensesStr, setOtherExpensesStr] = useState<string>('0');

  // 7. Masraf Kesinti / Ödeme Yöntemi
  const [deductionMode, setDeductionMode] = useState<ExpenseDeductionMode>('deduct_all');

  // 8. UI Durumları
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Sayı formatlayıcılar
  const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR').format(num);
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(num);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Kredi türüne göre dinamik hazır tutar butonları
  const presetAmounts = useMemo(() => {
    switch (loanType) {
      case 'konut':
        return [
          { label: '1.000.000 TL', val: 1000000 },
          { label: '2.000.000 TL', val: 2000000 },
          { label: '3.500.000 TL', val: 3500000 },
          { label: '5.000.000 TL', val: 5000000 },
        ];
      case 'tasit':
        return [
          { label: '300.000 TL', val: 300000 },
          { label: '600.000 TL', val: 600000 },
          { label: '1.000.000 TL', val: 1000000 },
          { label: '1.500.000 TL', val: 1500000 },
        ];
      case 'ticari':
        return [
          { label: '500.000 TL', val: 500000 },
          { label: '1.500.000 TL', val: 1500000 },
          { label: '3.000.000 TL', val: 3000000 },
          { label: '10.000.000 TL', val: 10000000 },
        ];
      case 'ihtiyac':
      default:
        return [
          { label: '50.000 TL', val: 50000 },
          { label: '100.000 TL', val: 100000 },
          { label: '250.000 TL', val: 250000 },
          { label: '500.000 TL', val: 500000 },
        ];
    }
  }, [loanType]);

  // Limit süresine göre azami limit tahsis tavanı (%0,20 * ay / 12)
  const commercialLimitCeilingRate = useMemo(() => {
    return calculateCommercialLimitCeilingRate(commercialLimitMonths);
  }, [commercialLimitMonths]);

  // Vade gün sayısına göre ticari yasal tavan oranı hesabı (TCMB 360 gün esası)
  const commercialUsageCeilingRate = useMemo(() => {
    return calculateCommercialUsageCeilingRate(commercialKind, termDays);
  }, [commercialKind, termDays]);

  // Canlı Matematiksel Hesaplama
  const calcOutput = useMemo(() => {
    return calculateLoanFee(loanAmount, {
      loanAmount,
      loanType,
      hasExistingHome,
      feeRate: inputMode === 'rate' ? feeRate : undefined,
      customFeeAmount: inputMode === 'amount' ? customFeeAmount : undefined,
      commercialKind: loanType === 'ticari' ? commercialKind : undefined,
      commercialLimitAmount: loanType === 'ticari' ? commercialLimitAmount : undefined,
      commercialLimitMonths: loanType === 'ticari' ? commercialLimitMonths : undefined,
      termDays: loanType === 'ticari' ? termDays : undefined,
      startDate: loanType === 'ticari' && vadeInputMode === 'dates' ? startDate : undefined,
      endDate: loanType === 'ticari' && vadeInputMode === 'dates' ? endDate : undefined,
      rotatifAverageBalance: loanType === 'ticari' ? rotatifAverageBalance : undefined,
      commercialLimitFeeRate: loanType === 'ticari' ? commercialLimitFeeRate : undefined,
      commercialUsageFeeRate: loanType === 'ticari' ? commercialUsageFeeRate : undefined,
      includeBsmv: true,
      valuationFee,
      mortgageFee,
      insuranceFee,
      otherExpenses,
      deductionMode,
    });
  }, [
    loanAmount,
    loanType,
    hasExistingHome,
    inputMode,
    feeRate,
    customFeeAmount,
    commercialKind,
    commercialLimitAmount,
    commercialLimitMonths,
    termDays,
    vadeInputMode,
    startDate,
    endDate,
    rotatifAverageBalance,
    commercialLimitFeeRate,
    commercialUsageFeeRate,
    valuationFee,
    mortgageFee,
    insuranceFee,
    otherExpenses,
    deductionMode,
  ]);

  const raw = calcOutput.raw;

  // Masraf Dağılım Çubuğu Yüzdeleri
  const barPercentages = useMemo(() => {
    if (raw.totalCost <= 0) {
      return { bank: 0, tax: 0, third: 0 };
    }
    const bank = (raw.allocationFee / raw.totalCost) * 100;
    const tax = (raw.bsmvAmount / raw.totalCost) * 100;
    const third = (raw.totalOtherExpenses / raw.totalCost) * 100;
    return { bank, tax, third };
  }, [raw.allocationFee, raw.bsmvAmount, raw.totalOtherExpenses, raw.totalCost]);

  // Kredi tutarı değişim işleyicileri
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      setLoanAmountStr('');
      setLoanAmount(0);
      return;
    }
    const num = parseInt(digits, 10);
    setLoanAmount(num);
    setLoanAmountStr(formatThousands(num));
    if (loanType === 'ticari' && commercialLimitAmount === loanAmount) {
      setCommercialLimitAmount(num);
      setCommercialLimitAmountStr(formatThousands(num));
    }
    if (inputMode === 'amount') {
      const defFee = Math.round(num * 0.005);
      setCustomFeeAmount(defFee);
      setCustomFeeAmountStr(formatThousands(defFee));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLoanAmount(val);
    setLoanAmountStr(formatThousands(val));
    if (loanType === 'ticari' && commercialLimitAmount === loanAmount) {
      setCommercialLimitAmount(val);
      setCommercialLimitAmountStr(formatThousands(val));
    }
    if (inputMode === 'amount') {
      const defFee = Math.round(val * 0.005);
      setCustomFeeAmount(defFee);
      setCustomFeeAmountStr(formatThousands(defFee));
    }
  };

  const handlePresetClick = (val: number) => {
    setLoanAmount(val);
    setLoanAmountStr(formatThousands(val));
    if (loanType === 'ticari') {
      setCommercialLimitAmount(val);
      setCommercialLimitAmountStr(formatThousands(val));
    }
    if (inputMode === 'amount') {
      const defFee = Math.round(val * 0.005);
      setCustomFeeAmount(defFee);
      setCustomFeeAmountStr(formatThousands(defFee));
    }
  };

  // Ticari Limit Tutarı İşleyicisi
  const handleLimitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      setCommercialLimitAmountStr('');
      setCommercialLimitAmount(0);
      return;
    }
    const num = parseInt(digits, 10);
    setCommercialLimitAmount(num);
    setCommercialLimitAmountStr(formatThousands(num));
  };

  // Ticari Limit Süresi (Ay) Değişimi
  const handleLimitMonthsChange = (months: number) => {
    setCommercialLimitMonths(months);
    const ceiling = calculateCommercialLimitCeilingRate(months);
    setCommercialLimitFeeRate(ceiling);
    setCommercialLimitFeeRateStr(ceiling.toFixed(2).replace('.', ','));
  };

  // Rotatif Ortalama Bakiye İşleyicisi
  const handleRotatifBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      setRotatifAverageBalanceStr('');
      setRotatifAverageBalance(0);
      return;
    }
    const num = parseInt(digits, 10);
    setRotatifAverageBalance(num);
    setRotatifAverageBalanceStr(formatThousands(num));
  };

  // Vade Gün Sayısı Değişimi
  const handleTermDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      setTermDaysStr('');
      setTermDays(0);
      return;
    }
    const days = parseInt(digits, 10);
    setTermDays(days);
    setTermDaysStr(days.toString());
    if (commercialKind !== 'doviz') {
      const ceiling = calculateCommercialUsageCeilingRate(commercialKind, days);
      if (ceiling !== null) {
        setCommercialUsageFeeRate(ceiling);
        setCommercialUsageFeeRateStr(ceiling.toFixed(2).replace('.', ','));
      }
    }
  };

  const handleQuickDaySelect = (days: number) => {
    setTermDays(days);
    setTermDaysStr(days.toString());
    if (commercialKind !== 'doviz') {
      const ceiling = calculateCommercialUsageCeilingRate(commercialKind, days);
      if (ceiling !== null) {
        setCommercialUsageFeeRate(ceiling);
        setCommercialUsageFeeRateStr(ceiling.toFixed(2).replace('.', ','));
      }
    }
  };

  // Tarih Aralığı Değişimleri
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    if (val && endDate) {
      const diff = calculateDaysBetween(val, endDate);
      if (diff > 0) {
        setTermDays(diff);
        setTermDaysStr(diff.toString());
        if (commercialKind !== 'doviz') {
          const ceiling = calculateCommercialUsageCeilingRate(commercialKind, diff);
          if (ceiling !== null) {
            setCommercialUsageFeeRate(ceiling);
            setCommercialUsageFeeRateStr(ceiling.toFixed(2).replace('.', ','));
          }
        }
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    if (startDate && val) {
      const diff = calculateDaysBetween(startDate, val);
      if (diff > 0) {
        setTermDays(diff);
        setTermDaysStr(diff.toString());
        if (commercialKind !== 'doviz') {
          const ceiling = calculateCommercialUsageCeilingRate(commercialKind, diff);
          if (ceiling !== null) {
            setCommercialUsageFeeRate(ceiling);
            setCommercialUsageFeeRateStr(ceiling.toFixed(2).replace('.', ','));
          }
        }
      }
    }
  };

  // Tahsis oranı işleyicisi (Bireysel)
  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
    setFeeRateStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setFeeRate(parsed);
    }
  };

  // Sabit tutar işleyicisi (Bireysel)
  const handleCustomFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      setCustomFeeAmountStr('');
      setCustomFeeAmount(0);
      return;
    }
    const num = parseInt(digits, 10);
    setCustomFeeAmount(num);
    setCustomFeeAmountStr(formatThousands(num));
  };

  // Ticari limit oranı işleyicisi
  const handleCommercialLimitRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
    setCommercialLimitFeeRateStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setCommercialLimitFeeRate(parsed);
    }
  };

  // Ticari kullandırım oranı işleyicisi
  const handleCommercialUsageRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
    setCommercialUsageFeeRateStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setCommercialUsageFeeRate(parsed);
    }
  };

  // Masraf alanı işleyicileri
  const makeExpenseHandler = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    strSetter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    if (!digits) {
      strSetter('0');
      setter(0);
      return;
    }
    const num = parseInt(digits, 10);
    setter(num);
    strSetter(formatThousands(num));
  };

  // Sunucu eylemi
  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      await calculateAction(calculator.slug, {
        loanAmount,
        loanType,
        hasExistingHome,
        feeRate: inputMode === 'rate' ? feeRate : undefined,
        customFeeAmount: inputMode === 'amount' ? customFeeAmount : undefined,
        commercialKind: loanType === 'ticari' ? commercialKind : undefined,
        commercialLimitAmount: loanType === 'ticari' ? commercialLimitAmount : undefined,
        commercialLimitMonths: loanType === 'ticari' ? commercialLimitMonths : undefined,
        termDays: loanType === 'ticari' ? termDays : undefined,
        startDate: loanType === 'ticari' && vadeInputMode === 'dates' ? startDate : undefined,
        endDate: loanType === 'ticari' && vadeInputMode === 'dates' ? endDate : undefined,
        rotatifAverageBalance: loanType === 'ticari' ? rotatifAverageBalance : undefined,
        commercialLimitFeeRate: loanType === 'ticari' ? commercialLimitFeeRate : undefined,
        commercialUsageFeeRate: loanType === 'ticari' ? commercialUsageFeeRate : undefined,
        includeBsmv: true,
        valuationFee,
        mortgageFee,
        insuranceFee,
        otherExpenses,
        deductionMode,
      });
    } catch (err) {
      console.error('Kredi dosya masrafı hesaplama hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Kredi Türü Segment Seçimi
  const handleLoanTypeSelect = (type: LoanType) => {
    setLoanType(type);
    if (type === 'konut' && loanAmount < 500000) {
      setLoanAmount(1500000);
      setLoanAmountStr(formatThousands(1500000));
      if (inputMode === 'amount') {
        setCustomFeeAmount(7500);
        setCustomFeeAmountStr(formatThousands(7500));
      }
    } else if (type === 'ticari') {
      setCommercialLimitAmount(loanAmount);
      setCommercialLimitAmountStr(formatThousands(loanAmount));
      setCommercialLimitMonths(12);
      setTermDays(360);
      setTermDaysStr('360');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style>{sliderStyles}</style>

      {/* Ana Form ve Sonuç Izgarası */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ============================================================ */}
          {/* SOL PANEL: GİRDİLER (7 Kolon) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            
            {/* 1. KREDİ TÜRÜ SEGMENTLERİ */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Kredi Türünü Seçin
              </label>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* İhtiyaç Kredisi */}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('ihtiyac')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 min-h-[96px] ${
                    loanType === 'ihtiyac'
                      ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Coins className={`w-5 h-5 ${loanType === 'ihtiyac' ? 'text-violet-600' : 'text-slate-400'}`} />
                    {loanType === 'ihtiyac' && (
                      <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">İhtiyaç Kredisi</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      %0,50 Tavan • %15 BSMV
                    </div>
                  </div>
                </button>

                {/* Konut Kredisi */}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('konut')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 min-h-[96px] ${
                    loanType === 'konut'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Home className={`w-5 h-5 ${loanType === 'konut' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {loanType === 'konut' && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">Konut Kredisi</div>
                    <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      {hasExistingHome ? '%15 BSMV (7491 SK)' : '%0 BSMV Muaf (İlk Ev)'}
                    </div>
                  </div>
                </button>

                {/* Taşıt Kredisi */}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('tasit')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 min-h-[96px] ${
                    loanType === 'tasit'
                      ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Car className={`w-5 h-5 ${loanType === 'tasit' ? 'text-violet-600' : 'text-slate-400'}`} />
                    {loanType === 'tasit' && (
                      <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">Taşıt Kredisi</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      %0,50 Tavan • %15 BSMV
                    </div>
                  </div>
                </button>

                {/* Ticari Kredi */}
                <button
                  type="button"
                  onClick={() => handleLoanTypeSelect('ticari')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 min-h-[96px] ${
                    loanType === 'ticari'
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Briefcase className={`w-5 h-5 ${loanType === 'ticari' ? 'text-purple-600' : 'text-slate-400'}`} />
                    {loanType === 'ticari' && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">Ticari Kredi</div>
                    <div className="text-[11px] font-semibold text-purple-700 mt-0.5">
                      TCMB 2020/4 • %5 BSMV
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* KONUT KREDİSİ İÇİN 7491 SAYILI KANUN M.6 BSMV SORUSU */}
            {loanType === 'konut' && (
              <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-3 transition-all">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Konut BSMV İstisnası Denetimi (7491 Sayılı Kanun m. 6)
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      28.12.2023 tarihli düzenleme uyarınca; kredi kullanım tarihinde tapuda üzerine kayıtlı konut veya hissesi olmayanlar <strong>%0 BSMV</strong> muafiyetinden yararlanır. Üzerine kayıtlı konutu olanlar için BSMV oranı <strong>%15</strong>'tir.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Kredi kullanım tarihinde üzerinize kayıtlı bir konut veya hisse var mı?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasExistingHome(false)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                        !hasExistingHome
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">Hayır (İlk Evim)</div>
                        <div className="text-[11px] font-semibold text-emerald-700">%0 BSMV (İstisna)</div>
                      </div>
                      {!hasExistingHome && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasExistingHome(true)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                        hasExistingHome
                          ? 'border-amber-600 bg-white ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">Evet (Kayıtlı Konut Var)</div>
                        <div className="text-[11px] font-semibold text-amber-700">%15 BSMV Uygulanır</div>
                      </div>
                      {hasExistingHome && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. KREDİ TUTARI (KULLANDIRIM MATRAHI) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {loanType === 'ticari' ? '2. Kullandırılan Kredi Tutarı' : '2. Kredi Tutarı'}
                </label>
                <span className="text-xs font-medium text-slate-400">
                  Min 10.000 TL — Maks 10.000.000 TL
                </span>
              </div>

              {/* Tutar Input */}
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={loanAmountStr}
                  onChange={handleLoanAmountChange}
                  className="w-full h-14 pl-4 pr-14 text-xl md:text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                  placeholder="100.000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none">
                  {commercialKind === 'doviz' && loanType === 'ticari' ? 'YP / TL' : 'TL'}
                </span>
              </div>

              {/* Slider */}
              <div className="pt-1">
                <input
                  type="range"
                  min={10000}
                  max={loanType === 'konut' || loanType === 'ticari' ? 10000000 : 2000000}
                  step={10000}
                  value={loanAmount}
                  onChange={handleSliderChange}
                  className="loan-fee-slider"
                />
              </div>

              {/* Hazır Tutar Çipleri */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presetAmounts.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => handlePresetClick(p.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                      loanAmount === p.val
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. TAHSİS / KOMİSYON ÜCRETLERİ */}
            {loanType === 'ticari' ? (
              /* TİCARİ KREDİ TCMB 2020/4 MADDE 9 ÇİFT MASRAF GİRİŞİ */
              <div className="space-y-6 p-5 md:p-6 rounded-2xl border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    3. Ticari Kredi Ücretleri (TCMB 2020/4 Tebliği Madde 9)
                  </label>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                    %5 BSMV (6802 SK m. 33)
                  </span>
                </div>

                {/* Ticari Kredi Alt Türü (Taksitli TL / Rotatif TL / Döviz) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Ticari Kredi Türü</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCommercialKind('taksitli_tl')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        commercialKind === 'taksitli_tl'
                          ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 font-bold text-purple-900 shadow-xs'
                          : 'border-slate-200 bg-white/70 text-slate-700'
                      }`}
                    >
                      <div className="text-xs">Taksitli / Spot TL</div>
                      <div className="text-[10px] text-slate-500 font-normal">Gün bazlı orantılı tavan</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommercialKind('rotatif_tl')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        commercialKind === 'rotatif_tl'
                          ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 font-bold text-purple-900 shadow-xs'
                          : 'border-slate-200 bg-white/70 text-slate-700'
                      }`}
                    >
                      <div className="text-xs">Rotatif (BCH) TL</div>
                      <div className="text-[10px] text-slate-500 font-normal">Dönem ortalama bakiye</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommercialKind('doviz')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        commercialKind === 'doviz'
                          ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 font-bold text-purple-900 shadow-xs'
                          : 'border-slate-200 bg-white/70 text-slate-700'
                      }`}
                    >
                      <div className="text-xs">Döviz Cinsi Kredi</div>
                      <div className="text-[10px] text-slate-500 font-normal">Serbest kullandırım ücreti</div>
                    </button>
                  </div>
                </div>

                {/* ======================================================= */}
                {/* BÖLÜM A: KREDİ LİMİT TAHSİS ÜCRETİ (TCMB 2020/4 MADDE 9) */}
                {/* ======================================================= */}
                <div className="space-y-3 pt-3 border-t border-purple-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wide">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      A) Kredi Limit Tahsis Ücreti
                    </span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                      Yıllık Azami %0,20
                    </span>
                  </div>

                  {/* Limit Tutarı ve Limit Süresi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Limit Tutarı */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Tahsis Edilen Kredi Limiti (TL)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={commercialLimitAmountStr}
                          onChange={handleLimitAmountChange}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                          placeholder="100.000"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                          TL
                        </span>
                      </div>
                    </div>

                    {/* Limit Tahsis Süresi (Ay) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Limit Tahsis Süresi</span>
                        <span className="text-purple-700 font-bold">
                          Tavan: %{commercialLimitCeilingRate.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[3, 6, 12, 24].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleLimitMonthsChange(m)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              commercialLimitMonths === m
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {m} Ay
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Limit Tahsis Ücreti Oranı ve Tutar Göstergesi */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Limit Tahsis Ücreti Oranı (%)</span>
                      <span className="text-[11px] text-slate-500">
                        {commercialLimitMonths} Ay İçin Tavan: %{commercialLimitCeilingRate.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={commercialLimitFeeRateStr}
                        onChange={handleCommercialLimitRateChange}
                        className="w-full h-11 pl-9 pr-10 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                        placeholder="0,20"
                      />
                      <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tutar: {formatCurrency(raw.commercialLimitFee || 0)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCommercialLimitFeeRate(commercialLimitCeilingRate);
                          setCommercialLimitFeeRateStr(commercialLimitCeilingRate.toFixed(2).replace('.', ','));
                        }}
                        className="text-purple-600 hover:underline font-bold"
                      >
                        Tavanı Uygula (%{commercialLimitCeilingRate.toFixed(2)})
                      </button>
                    </div>
                  </div>
                </div>

                {/* ======================================================= */}
                {/* BÖLÜM B: KREDİ KULLANDIRIM ÜCRETİ (TCMB 2020/4 MADDE 9) */}
                {/* ======================================================= */}
                <div className="space-y-3 pt-3 border-t border-purple-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wide">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      B) Kredi Kullandırım Ücreti
                    </span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                      {commercialKind === 'doviz'
                        ? 'Serbest Oran (TL Dışı)'
                        : termDays < 360
                        ? `Azami Tavan %${commercialUsageCeilingRate?.toFixed(2)} (${termDays} Gün)`
                        : 'Azami Tavan %1,10'}
                    </span>
                  </div>

                  {/* Rotatif ise ortalama bakiye matrahı */}
                  {commercialKind === 'rotatif_tl' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Dönem Ortalama Kredi Kullandırım Bakiyesi</span>
                        <span className="text-[11px] text-purple-700">Kullandırım Matrahı</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rotatifAverageBalanceStr}
                          onChange={handleRotatifBalanceChange}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                          placeholder="100.000"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                          TL
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Kullandırım Vadesi (Gün / Tarih) */}
                  {commercialKind !== 'doviz' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                          Kredi Kullandırım Vadesi (TCMB 360 Gün Esası)
                        </span>

                        {/* Gün / Tarih Mod Değiştirici */}
                        <div className="flex items-center bg-purple-100/70 p-0.5 rounded-lg text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setVadeInputMode('days')}
                            className={`px-2 py-0.5 rounded-md transition-all ${
                              vadeInputMode === 'days'
                                ? 'bg-white text-purple-900 shadow-xs'
                                : 'text-purple-700 hover:text-purple-900'
                            }`}
                          >
                            Gün Sayısı
                          </button>
                          <button
                            type="button"
                            onClick={() => setVadeInputMode('dates')}
                            className={`px-2 py-0.5 rounded-md transition-all ${
                              vadeInputMode === 'dates'
                                ? 'bg-white text-purple-900 shadow-xs'
                                : 'text-purple-700 hover:text-purple-900'
                            }`}
                          >
                            Tarih Aralığı
                          </button>
                        </div>
                      </div>

                      {vadeInputMode === 'days' ? (
                        /* GÜN SAYISI GİRİŞİ */
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={termDaysStr}
                              onChange={handleTermDaysChange}
                              className="w-full h-11 px-3.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                              placeholder="360"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                              Gün
                            </span>
                          </div>

                          {/* Hazır Vade Çipleri (90 Gün, 180 Gün, 360 Gün, 720 Gün) */}
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: '90 Gün', sub: '3 Ay', days: 90 },
                              { label: '180 Gün', sub: '6 Ay', days: 180 },
                              { label: '360 Gün', sub: '1 Yıl', days: 360 },
                              { label: '720 Gün', sub: '2 Yıl', days: 720 },
                            ].map((c) => (
                              <button
                                key={c.days}
                                type="button"
                                onClick={() => handleQuickDaySelect(c.days)}
                                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                                  termDays === c.days
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div>{c.label}</div>
                                <div className="text-[10px] font-normal opacity-80">{c.sub}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* TARİH ARALIĞI GİRİŞİ */
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-medium text-slate-600 block mb-0.5">
                                Kredi Başlangıç Tarihi
                              </label>
                              <input
                                type="date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                className="w-full h-11 px-3 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-600 block mb-0.5">
                                Kredi Bitiş / Vade Tarihi
                              </label>
                              <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={handleEndDateChange}
                                className="w-full h-11 px-3 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                              />
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-purple-100/60 text-[11px] text-purple-900 font-semibold flex items-center justify-between">
                            <span>Hesaplanan Vade Gün Sayısı:</span>
                            <span className="font-bold">{termDays} Gün</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kullandırım Ücreti Oranı ve Tutarı */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>
                        {commercialKind === 'doviz'
                          ? 'Kullandırım Ücreti Oranı (%)'
                          : commercialKind === 'rotatif_tl'
                          ? 'Dönemsel Kullandırım Ücreti Oranı (%)'
                          : 'Kredi Kullandırım Ücreti Oranı (%)'}
                      </span>
                      <span className="text-[11px] font-bold text-purple-700">
                        {commercialKind === 'doviz'
                          ? 'Serbest Oran'
                          : `Maks %${commercialUsageCeilingRate?.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={commercialUsageFeeRateStr}
                        onChange={handleCommercialUsageRateChange}
                        className="w-full h-11 pl-9 pr-10 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:border-purple-600 outline-none"
                        placeholder="1,10"
                      />
                      <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tutar: {formatCurrency(raw.commercialUsageFee || 0)}</span>
                      {commercialUsageCeilingRate !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setCommercialUsageFeeRate(commercialUsageCeilingRate);
                            setCommercialUsageFeeRateStr(
                              commercialUsageCeilingRate.toFixed(2).replace('.', ',')
                            );
                          }}
                          className="text-purple-600 hover:underline font-bold"
                        >
                          Tavanı Uygula (%{commercialUsageCeilingRate.toFixed(2)})
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-purple-900 bg-purple-100/60 p-3 rounded-xl leading-relaxed">
                  TCMB 2020/4 Tebliği Madde 9 (2025/24 ve 2026/5 değişiklikleriyle güncel) uyarınca: Limit tahsis ücreti, tahsis edilen limit üzerinden limit süresinin ay sayısı dikkate alınarak yıllık azami %0,20 oranında uygulanır. Kredi kullandırım ücreti ise fiilen kullandırılan kredi tutarı üzerinden 360 gün ve üzeri vadelerde azami %1,10; 1 yıldan kısa vadeli TL kredilerde ise TCMB 360 gün ticari yıl esasına göre vade gün sayısı ile orantılı olarak (Gün / 360) düşürülerek uygulanır. Döviz kredilerinde kullandırım ücreti serbestçe belirlenir. Komisyonlar üzerinden %5 BSMV uygulanır.
                </div>
              </div>
            ) : (
              /* TÜKETİCİ KREDİSİ GİRİŞİ (İHTİYAÇ, KONUT, TAŞIT) */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    3. Kredi Tahsis Ücreti (Dosya Masrafı)
                  </label>

                  {/* Sekme Değiştirici: Oran vs Sabit Tutar */}
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setInputMode('rate')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        inputMode === 'rate'
                          ? 'bg-white text-violet-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      % Oran ile Gir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('amount');
                        const def = Math.round(loanAmount * (feeRate / 100));
                        setCustomFeeAmount(def);
                        setCustomFeeAmountStr(formatThousands(def));
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        inputMode === 'amount'
                          ? 'bg-white text-violet-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ₺ Sabit Tutar Gir
                    </button>
                  </div>
                </div>

                {inputMode === 'rate' ? (
                  /* ORAN MODU */
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={feeRateStr}
                        onChange={handleRateInputChange}
                        className="w-full h-14 pl-12 pr-14 text-xl md:text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                        placeholder="0,50"
                      />
                      <Percent className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none">
                        %
                      </span>
                    </div>

                    {/* Hızlı Oran Butonları */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '%0,25', val: 0.25 },
                        { label: '%0,50 (Yasal Tavan)', val: 0.50 },
                        { label: '%0,75', val: 0.75 },
                        { label: '%1,00', val: 1.00 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setFeeRate(item.val);
                            setFeeRateStr(item.val.toFixed(2).replace('.', ','));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                            feeRate === item.val
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* SABİT TUTAR MODU */
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customFeeAmountStr}
                        onChange={handleCustomFeeChange}
                        className="w-full h-14 pl-4 pr-14 text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                        placeholder="500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none">
                        TL
                      </span>
                    </div>

                    {/* Efektif Oran Göstergesi */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <span className="text-slate-600">
                        Efektif Tahsis Oranı: <strong>%{raw.feeRate.toFixed(2)}</strong>
                      </span>
                      <span className="text-slate-500">
                        Yasal Azami Komisyon: <strong>{formatCurrency(raw.legalCeilingAmount)}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MASRAF ÖDEME / KESİNTİ YÖNTEMİ */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Masraf Ödeme / Kesinti Yöntemi
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeductionMode('deduct_all')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[82px] ${
                    deductionMode === 'deduct_all'
                      ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-800">Tümü Krediden Kesilsin</span>
                    {deductionMode === 'deduct_all' && <Check className="w-4 h-4 text-violet-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Tüm masraflar anaparadan doğrudan mahsup edilir.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeductionMode('deduct_bank_fee_only')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[82px] ${
                    deductionMode === 'deduct_bank_fee_only'
                      ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-800">Banka Masrafı Kesilsin</span>
                    {deductionMode === 'deduct_bank_fee_only' && <Check className="w-4 h-4 text-violet-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Banka komisyonu kesilir, 3. taraf masraflar ayrıca ödenir.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeductionMode('pay_separately')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[82px] ${
                    deductionMode === 'pay_separately'
                      ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-800">Tümü Ayrıca Ödensin</span>
                    {deductionMode === 'pay_separately' && <Check className="w-4 h-4 text-violet-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Krediden kesinti yapılmaz, kredi tam tutar olarak yatar.
                  </span>
                </button>
              </div>
            </div>

            {/* 5. ÜÇÜNCÜ TARAF MASRAFLAR (AKORDİYON) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors min-h-[52px]"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-slate-800">
                      Üçüncü Taraf Belgelenmiş Masraflar (Opsiyonel)
                    </div>
                    <div className="text-xs text-slate-500">
                      Ekspertiz, Tapu İpotek, Rehin Tescili ve Sigorta Primleri
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                    {raw.totalOtherExpenses > 0
                      ? `${formatCurrency(raw.totalOtherExpenses)} Girildi`
                      : '0 TL'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isAccordionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {isAccordionOpen && (
                <div className="p-5 border-t border-slate-200 bg-white space-y-4">
                  {/* KONUT KREDİSİ İÇİN ALANLAR */}
                  {loanType === 'konut' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          SPK Lisanslı Ekspertiz Ücreti (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={valuationFeeStr}
                          onChange={makeExpenseHandler(setValuationFee, setValuationFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 15.000"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Değerleme şirketine fatura karşılığı ödenir; BSMV uygulanmaz.
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Tapu İpotek Tesis Harcı ve Masrafı (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={mortgageFeeStr}
                          onChange={makeExpenseHandler(setMortgageFee, setMortgageFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 2.500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Zorunlu Deprem (DASK) ve Konut Sigortası (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={insuranceFeeStr}
                          onChange={makeExpenseHandler(setInsuranceFee, setInsuranceFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 3.500"
                        />
                      </div>
                    </>
                  )}

                  {/* TAŞIT KREDİSİ İÇİN ALANLAR */}
                  {loanType === 'tasit' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Araç Rehin Tesis Ücreti (Noter / TNB Sistemi) (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={mortgageFeeStr}
                          onChange={makeExpenseHandler(setMortgageFee, setMortgageFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 1.500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Kasko ve Trafik Sigortası Primi (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={insuranceFeeStr}
                          onChange={makeExpenseHandler(setInsuranceFee, setInsuranceFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 18.000"
                        />
                      </div>
                    </>
                  )}

                  {/* İHTİYAÇ KREDİSİ İÇİN ALANLAR */}
                  {loanType === 'ihtiyac' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Hayat Sigortası Primi (Opsiyonel) (TL)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={insuranceFeeStr}
                        onChange={makeExpenseHandler(setInsuranceFee, setInsuranceFeeStr)}
                        className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                        placeholder="Örn: 1.200"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Yaş ve vadeye göre değişir; tüketicinin sigorta yaptırma zorunluluğu yoktur.
                      </span>
                    </div>
                  )}

                  {/* TİCARİ KREDİ İÇİN ALANLAR */}
                  {loanType === 'ticari' && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Ekspertiz ve Değerleme Masrafı (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={valuationFeeStr}
                          onChange={makeExpenseHandler(setValuationFee, setValuationFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 20.000"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          İpotek ve Noter Giderleri (TL)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={mortgageFeeStr}
                          onChange={makeExpenseHandler(setMortgageFee, setMortgageFeeStr)}
                          className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                          placeholder="Örn: 10.000"
                        />
                      </div>
                    </>
                  )}

                  {/* DİĞER BELGELENMİŞ GİDERLER (HER TÜRE AÇIK) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Diğer Fatura / Belgeye Dayalı Harcamalar (TL)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otherExpensesStr}
                      onChange={makeExpenseHandler(setOtherExpenses, setOtherExpensesStr)}
                      className="w-full h-11 px-3.5 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-600 outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Bu kalemler bankanın geliri değildir; resmi kurumlara veya sigorta acentelerine aktarılır. Banka bu giderlerden komisyon veya BSMV alamaz.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. HESAPLA BUTONU */}
            <div className="pt-2">
              <CalculatorSubmitButton
                text="Masrafları Hesapla"
                isLoading={isLoading}
                onClick={handleCalculate}
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* SAĞ PANEL: SONUÇLAR VE HİYERARŞİ (5 Kolon - Sticky) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 sticky top-8 flex flex-col space-y-4">
            
            {/* 1. KAHRAMAN SONUÇ KARTI: TOPLAM MASRAF */}
            <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-violet-200 text-xs font-bold uppercase tracking-wider">
                    Toplam Kredi Masrafı
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
                    {loanType === 'konut'
                      ? hasExistingHome
                        ? '%15 BSMV (7491 SK)'
                        : 'BSMV Muaf'
                      : `%${(raw.bsmvRate * 100).toFixed(0)} BSMV`}
                  </span>
                </div>

                <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  {isMounted ? (
                    <NumberFlow
                      value={raw.totalCost}
                      format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    formatCurrency(raw.totalCost)
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-violet-100">
                    Kredi Tutarının %{raw.effectiveFeeRatio.toFixed(2)}'si
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ELE GEÇECEK NET FİNANSMAN VURGUSU */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Elinize Geçecek Net Tutar
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {deductionMode === 'deduct_all'
                    ? 'Tüm Masraflar Düşüldü'
                    : deductionMode === 'deduct_bank_fee_only'
                    ? 'Yalnızca Banka Masrafı Düşüldü'
                    : 'Kesintisiz Net Tutar'}
                </span>
              </div>

              <div className="text-3xl md:text-4xl font-black text-emerald-950">
                {isMounted ? (
                  <NumberFlow
                    value={raw.netDisbursedAmount}
                    format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }}
                  />
                ) : (
                  formatCurrency(raw.netDisbursedAmount)
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-emerald-200">
                <div>
                  <span className="text-emerald-700 block">Krediden Kesilen:</span>
                  <span className="font-bold text-emerald-950">{formatCurrency(raw.deductedFromLoan)}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block">Ayrıca Ödenecek:</span>
                  <span className="font-bold text-emerald-950">{formatCurrency(raw.paidSeparately)}</span>
                </div>
              </div>
            </div>

            {/* 3. MASRAF DAĞILIM ÇUBUĞU */}
            {raw.totalCost > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Masraf Dağılımı</span>
                  <span className="text-slate-500">{formatCurrency(raw.totalCost)}</span>
                </div>

                {/* Bar */}
                <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    style={{ width: `${barPercentages.bank}%` }}
                    className="bg-violet-600 transition-all duration-300"
                    title={`Banka Payı: %${barPercentages.bank.toFixed(1)}`}
                  />
                  <div
                    style={{ width: `${barPercentages.tax}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`BSMV Vergisi: %${barPercentages.tax.toFixed(1)}`}
                  />
                  <div
                    style={{ width: `${barPercentages.third}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`3. Taraf Masrafları: %${barPercentages.third.toFixed(1)}`}
                  />
                </div>

                {/* Lejant */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600 flex-shrink-0" />
                    <span className="truncate">Banka Komisyonu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="truncate">BSMV Vergisi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="truncate">3. Taraf Masrafı</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DÖKÜM KARTLARI */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              {loanType === 'ticari' ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-600">
                      Limit Tahsis Ücreti (%{raw.commercialLimitFeeRate?.toFixed(2)} — Limit: {formatCurrency(raw.commercialLimitAmount || 0)}, {raw.commercialLimitMonths} Ay)
                    </span>
                    <span className="font-bold text-slate-900 shrink-0 whitespace-nowrap ml-2">
                      {formatCurrency(raw.commercialLimitFee || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-600">
                      {raw.commercialKind === 'doviz'
                        ? `Kullandırım Ücreti (%${raw.commercialUsageFeeRate?.toFixed(2)} — Serbest)`
                        : raw.commercialKind === 'rotatif_tl'
                        ? `Dönemsel Kullandırım Ücreti (%${raw.commercialUsageFeeRate?.toFixed(2)})`
                        : `Kullandırım Ücreti (%${raw.commercialUsageFeeRate?.toFixed(2)} — ${raw.termDays} Gün)`}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0 whitespace-nowrap ml-2">
                      {formatCurrency(raw.commercialUsageFee || 0)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Banka Kredi Tahsis Ücreti</span>
                  <span className="font-bold text-slate-900 shrink-0 whitespace-nowrap ml-2">{formatCurrency(raw.allocationFee)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600">Uygulanan BSMV Vergisi</span>
                <span className="font-bold text-slate-900 shrink-0 whitespace-nowrap ml-2">
                  {loanType === 'konut' && !hasExistingHome ? (
                    <span className="text-emerald-700 font-bold">0,00 TL (%0 İstisna)</span>
                  ) : (
                    `${formatCurrency(raw.bsmvAmount)} (%${(raw.bsmvRate * 100).toFixed(0)})`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600">Toplam Tahsis Masrafı (Banka + BSMV)</span>
                <span className="font-bold text-slate-900 shrink-0 whitespace-nowrap ml-2">
                  {formatCurrency(raw.totalAllocationCost)}
                </span>
              </div>

              {raw.totalOtherExpenses > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Belgelenmiş 3. Taraf Masrafları</span>
                  <span className="font-bold text-slate-900 shrink-0 whitespace-nowrap ml-2">
                    {formatCurrency(raw.totalOtherExpenses)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600 font-semibold">Efektif Masraf Oranı</span>
                <span className="font-black text-violet-700 shrink-0 whitespace-nowrap ml-2">
                  %{raw.effectiveFeeRatio.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 5. YASAL UYARI VE GÜVENCE BANNER'I */}
            {raw.isOverCeiling ? (
              /* AŞIM ALARMI */
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    {loanType === 'ticari'
                      ? 'TCMB 2020/4 Madde 9 Yasal Üst Sınır Aşımı!'
                      : 'TCMB 2020/7 Yasal Üst Sınır Aşımı! (Madde 10)'}
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {loanType === 'ticari' ? (
                    <>
                      TCMB 2020/4 Tebliği Madde 9 uyarınca ticari kredilerde limit tahsis ücreti limit süresine orantılı yıllık azami %0,20; kredi kullandırım ücreti ise 360 gün ve üzeri vadelerde azami %1,10 (kısa vadelerde vade gün sayısı ile orantılı) ile sınırlandırılmıştır. Hesaplanan komisyon yasal tavanı{' '}
                      <strong>{formatCurrency(raw.excessAmount)}</strong> aşmaktadır.
                    </>
                  ) : (
                    <>
                      Tüketici kredilerinde bankanın tahsil edebileceği azami kredi tahsis ücreti anaparanın{' '}
                      <strong>%0,50'sini (binde 5)</strong> geçemez. Hesaplanan tutar yasal tavanı{' '}
                      <strong>{formatCurrency(raw.excessAmount)}</strong> aşmaktadır.
                    </>
                  )}
                </p>
                {loanType !== 'ticari' && (
                  <p className="text-[11px] text-rose-700 bg-white/70 p-2.5 rounded-xl border border-rose-200">
                    💡 <strong>Hak Arama Rehberi:</strong> Bankanız bu tutarı tahsis ücreti adı altında talep ettiyse, yasal sınırı aşan kısmı e-Devlet üzerinden <strong>Tüketici Hakem Heyetine (THH)</strong> başvurarak yasal faiziyle geri alabilirsiniz.
                  </p>
                )}
              </div>
            ) : loanType === 'ticari' ? (
              /* TİCARİ BİLGİLENDİRME */
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1.5 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-purple-900">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span>TCMB 2020/4 Madde 9 Güvencesi</span>
                </div>
                <p className="text-purple-800 leading-relaxed">
                  {commercialKind === 'doviz'
                    ? 'Döviz cinsi nakdi kredilerde kredi kullandırım ücreti serbestçe belirlenir; limit tahsis ücreti tavanı yıllık %0,20 ve BSMV oranı %5’tir.'
                    : commercialKind === 'rotatif_tl'
                    ? 'Rotatif kredilerde kullandırım ücreti dönem ortalama bakiyesi üzerinden döneme orantılı olarak dönem sonunda tahakkuk ettirilir. Limit tahsis tavanı yıllık %0,20 ve BSMV %5’tir.'
                    : `Limit tahsis ücreti (${commercialLimitMonths} ay için azami %${commercialLimitCeilingRate.toFixed(2)}) ve kullandırım ücreti (${termDays < 360 ? `${termDays} gün için azami %${commercialUsageCeilingRate?.toFixed(2)}` : 'azami %1,10'}) TCMB 2020/4 Madde 9 sınırları dahilindedir. BSMV oranı %5'tir.`}
                </p>
              </div>
            ) : (
              /* TÜKETİCİ YASAL GÜVENCE BANNER'I */
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>TCMB 2020/7 & 7491 Sayılı Kanun Güvencesi</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Hesaplanan tahsis ücreti yasal tavan olan binde beş (%0,50) sınırına uygundur.
                  {loanType === 'konut' ? (
                    hasExistingHome ? (
                      ' 7491 sayılı Kanun m. 6 uyarınca üzerine kayıtlı konutu olan müşterilerin konut kredisinde %15 BSMV uygulanır.'
                    ) : (
                      ' İlk evini alan tüketiciler için 6802 sayılı Kanun m. 29/i uyarınca %0 BSMV istisnası uygulanır.'
                    )
                  ) : (
                    ' Tahsis ücreti finansal hizmet sayıldığından üzerine %15 BSMV uygulanmıştır.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paylaşım Bileşeni */}
      <ShareResult
        calculatorName="Kredi Dosya Masrafı Hesaplama"
        slug="kredi-dosya-masrafi"
        data={{
          primaryLabel: 'Toplam Kredi Masrafı',
          primaryResult: formatCurrency(raw.totalCost),
          secondaryResults: {
            'Kredi Tutarı': formatCurrency(raw.loanAmount),
            'Kredi Türü':
              loanType === 'ihtiyac'
                ? 'İhtiyaç Kredisi'
                : loanType === 'konut'
                ? `Konut Kredisi (${hasExistingHome ? 'Kayıtlı Konut Var' : 'İlk Evim'})`
                : loanType === 'tasit'
                ? 'Taşıt Kredisi'
                : `Ticari Kredi (${commercialKind === 'doviz' ? 'Döviz' : commercialKind === 'rotatif_tl' ? 'Rotatif' : 'Taksitli TL'})`,
            'Banka Tahsis Ücreti': formatCurrency(raw.allocationFee),
            'Uygulanan BSMV':
              loanType === 'konut'
                ? hasExistingHome
                  ? `${formatCurrency(raw.bsmvAmount)} (%15 — 7491 SK)`
                  : '0,00 TL (%0 Muaf)'
                : `${formatCurrency(raw.bsmvAmount)} (%${(raw.bsmvRate * 100).toFixed(0)})`,
            '3. Taraf Masrafları': formatCurrency(raw.totalOtherExpenses),
            'Toplam Masraf': formatCurrency(raw.totalCost),
            'Krediden Kesilen Masraf': formatCurrency(raw.deductedFromLoan),
            'Ayrıca Ödenecek Masraf': formatCurrency(raw.paidSeparately),
            'Ele Geçen Net Tutar': formatCurrency(raw.netDisbursedAmount),
            'Efektif Masraf Oranı': `%${raw.effectiveFeeRatio.toFixed(2)}`,
          },
        }}
      />
    </div>
  );
}

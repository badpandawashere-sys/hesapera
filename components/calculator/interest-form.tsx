'use client';

import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { PiggyBank, Loader2, Info } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface InterestFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .int-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .int-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #10B981;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    transition: transform 0.1s;
  }
  .int-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .int-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #10B981;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    transition: transform 0.1s;
  }
  .int-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
  
  .yield-pattern {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.15) 10px,
      transparent 10px,
      transparent 20px
    );
  }
`;

export function InterestForm({ calculator }: InterestFormProps) {
  const [calculationType, setCalculationType] = useState<'simple' | 'compound'>('simple');
  
  const [principal, setPrincipal] = useState<number>(100000);
  const [principalStr, setPrincipalStr] = useState<string>("100.000");
  
  const [annualRate, setAnnualRate] = useState<number>(20);
  const [annualRateStr, setAnnualRateStr] = useState<string>("20");
  
  const [term, setTerm] = useState<number>(12);
  const [termStr, setTermStr] = useState<string>("12");
  
  const [termUnit, setTermUnit] = useState<'month' | 'year'>('month');
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("12");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, [calculationType, termUnit, compoundingFrequency]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        calculationType,
        principal,
        annualRate,
        term,
        termUnit,
        compoundingFrequency: calculationType === 'compound' ? compoundingFrequency : undefined
      });

      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseFormattedNumber = (str: string) => {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR').format(num);

  // --- Handlers ---
  const handlePrincipalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setPrincipalStr("");
      setPrincipal(0);
      return;
    }
    const num = parseInt(val, 10);
    setPrincipal(num);
    setPrincipalStr(formatThousands(num));
  };
  const handlePrincipalSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setPrincipal(num);
    setPrincipalStr(formatThousands(num));
  };

  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setAnnualRateStr(e.target.value);
    const num = parseFloat(val);
    if (!isNaN(num)) setAnnualRate(num);
  };
  const handleRateSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setAnnualRate(num);
    setAnnualRateStr(num.toString());
  };

  const handleTermInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setTermStr("");
      setTerm(0);
      return;
    }
    const num = parseInt(val, 10);
    setTerm(num);
    setTermStr(num.toString());
  };
  const handleTermSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setTerm(num);
    setTermStr(num.toString());
  };

  // --- Data Extraction ---
  const totalAmountStr = result?.data?.primaryResult || '0,00 ₺';
  const totalAmountVal = parseFormattedNumber(totalAmountStr);
  
  const originalPrincipalStr = result?.data?.secondaryResults?.['Ana Para'] || `${formatThousands(principal)} ₺`;
  const originalPrincipalVal = parseFormattedNumber(originalPrincipalStr);
  
  const interestEarnedStr = result?.data?.secondaryResults?.['Faiz Tutarı'] || '0,00 ₺';
  const interestEarnedVal = parseFormattedNumber(interestEarnedStr);
  
  const originalRateStr = result?.data?.secondaryResults?.['Faiz Oranı'] || `%${annualRate}`;
  const originalTermStr = result?.data?.secondaryResults?.['Süre'] || `${term} ${termUnit === 'month' ? 'Ay' : 'Yıl'}`;
  const interestTypeStr = result?.data?.secondaryResults?.['Faiz Türü'] || (calculationType === 'simple' ? 'Basit Faiz' : 'Bileşik Faiz');
  const freqStr = result?.data?.secondaryResults?.['Bileşikleşme Sıklığı'];

  // Ratios for Yield Breakdown
  const principalRatio = totalAmountVal > 0 ? (originalPrincipalVal / totalAmountVal) * 100 : 100;
  const interestRatio = totalAmountVal > 0 ? (interestEarnedVal / totalAmountVal) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - INTERACTION */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <PiggyBank className="w-6 h-6" />
                </div>
                Faiz Hesaplama
              </h2>
              <p className="text-slate-500 text-sm">Ana para, faiz oranı ve süre ile basit veya bileşik faiz getirinizi hesaplayın.</p>
            </div>

            <div className="space-y-6">
              
              {/* SEGMENTED CONTROL */}
              <div className="bg-slate-100/80 p-1.5 rounded-2xl flex relative w-full">
                <button
                  onClick={() => setCalculationType('simple')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${calculationType === 'simple' ? 'text-emerald-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Basit Faiz
                </button>
                <button
                  onClick={() => setCalculationType('compound')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${calculationType === 'compound' ? 'text-emerald-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Bileşik Faiz
                </button>
              </div>

              {/* ANA PARA */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Ana Para (₺)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={principalStr}
                  onChange={handlePrincipalInputChange}
                  onBlur={handleCalculate}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="100.000"
                />
                <input type="range" min={1000} max={10000000} step={1000} value={principal} onChange={handlePrincipalSliderChange} onMouseUp={handleCalculate} onTouchEnd={handleCalculate} className="int-slider w-full mt-3" />
              </div>

              {/* FAİZ ORANI */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Yıllık Faiz Oranı (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={annualRateStr}
                  onChange={handleRateInputChange}
                  onBlur={handleCalculate}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="20"
                />
                <input type="range" min={0.1} max={100} step={0.1} value={annualRate} onChange={handleRateSliderChange} onMouseUp={handleCalculate} onTouchEnd={handleCalculate} className="int-slider w-full mt-3" />
              </div>

              {/* SÜRE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Süre</label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                    <button onClick={() => setTermUnit('month')} className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${termUnit === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Ay</button>
                    <button onClick={() => setTermUnit('year')} className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${termUnit === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Yıl</button>
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={termStr}
                  onChange={handleTermInputChange}
                  onBlur={handleCalculate}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder={termUnit === 'month' ? '12' : '1'}
                />
                <input type="range" min={1} max={termUnit === 'month' ? 360 : 30} step={1} value={term} onChange={handleTermSliderChange} onMouseUp={handleCalculate} onTouchEnd={handleCalculate} className="int-slider w-full mt-3" />
              </div>

              {calculationType === 'compound' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Bileşikleşme Sıklığı</label>
                  <select
                    value={compoundingFrequency}
                    onChange={e => { setCompoundingFrequency(e.target.value); }}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="1">Yıllık</option>
                    <option value="2">6 Aylık</option>
                    <option value="4">3 Aylık</option>
                    <option value="12">Aylık</option>
                    <option value="52">Haftalık</option>
                    <option value="365">Günlük</option>
                  </select>
                </div>
              )}

              <div className="w-full flex justify-center mt-6">
              <div className="w-full max-w-[280px]">
                <CalculatorSubmitButton 
                  onClick={handleCalculate} 
                  isLoading={isLoading} 
                  className="!h-[64px] !text-[24px] [&>img]:!h-[42px] shadow-xl hover:shadow-2xl" 
                />
              </div>
            </div>
            </div>
          </div>

          {/* RIGHT COLUMN - DEPOSIT GROWTH & YIELD BREAKDOWN */}
          <div className="lg:col-span-7 flex flex-col justify-center h-full space-y-8">
            
            {/* TOTAL DEPOSIT CARD */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-xl shadow-emerald-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <PiggyBank className="w-32 h-32 text-white" />
              </div>
              
              <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wider mb-2 relative z-10">
                Vade Sonu Toplam Tutar
              </span>
              
              <div className="text-4xl sm:text-5xl font-extrabold text-white flex items-baseline gap-2 relative z-10">
                {isMounted ? (
                  <NumberFlow 
                    value={totalAmountVal}
                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                  />
                ) : (
                  <span>{formatThousands(totalAmountVal)}</span>
                )}
                <span className="text-2xl sm:text-3xl font-medium opacity-80">₺</span>
              </div>
            </div>

            {/* YIELD BREAKDOWN BAR */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-5">Varlık Dağılımı (Kazancın Payı)</h3>
              
              {/* Stacked Growth Bar */}
              <div className="h-8 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000 ease-out flex items-center justify-center text-[11px] font-bold text-white/90 overflow-hidden" 
                  style={{ width: `${principalRatio}%` }}
                  title="Ana Para"
                >
                  {principalRatio > 15 ? 'ANA PARA' : ''}
                </div>
                <div 
                  className="h-full bg-emerald-500 yield-pattern transition-all duration-1000 ease-out flex items-center justify-center text-[11px] font-bold text-white/90 overflow-hidden" 
                  style={{ width: `${interestRatio}%` }}
                  title="Faiz Tutarlı Getiri"
                >
                  {interestRatio > 15 ? 'FAİZ GETİRİSİ' : ''}
                </div>
              </div>
              
              <div className="flex justify-between items-start mt-4 px-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-md bg-blue-600"></div>
                    <span className="text-xs font-semibold text-slate-600">Ana Para</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 pl-5">{originalPrincipalStr}</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-600">Faiz Getirisi</span>
                    <div className="w-3 h-3 rounded-md bg-emerald-500"></div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 pr-5">+{interestEarnedStr}</span>
                </div>
              </div>
            </div>

            {/* SUMMARY INFO CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Ana Para</div>
                <div className="font-bold text-slate-800 text-sm">{originalPrincipalStr}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Faiz Oranı</div>
                <div className="font-bold text-slate-800 text-sm">{originalRateStr}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Süre</div>
                <div className="font-bold text-slate-800 text-sm">{originalTermStr}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <div className="text-[10px] uppercase font-semibold text-emerald-600 mb-1">Faiz Tutarı</div>
                <div className="font-bold text-emerald-700 text-sm">+{interestEarnedStr}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Faiz Türü</div>
                <div className="font-bold text-slate-800 text-sm">{interestTypeStr}</div>
              </div>
              {calculationType === 'compound' && freqStr && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Bileşikleşme</div>
                  <div className="font-bold text-slate-800 text-sm">{freqStr}</div>
                </div>
              )}
            </div>

            {/* INFO REFERENCE */}
            {result?.data?.infoReference && (
              <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-100/50 p-4 rounded-2xl text-blue-800">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-sm">{result.data.infoReference.title}</h5>
                  <p className="text-[11px] mt-1 leading-relaxed opacity-90">{result.data.infoReference.description}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}





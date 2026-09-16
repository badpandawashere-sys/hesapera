'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { Lock, Loader2, Info, ArrowDown, Landmark } from 'lucide-react';
import NumberFlow from '@number-flow/react';

import { NumericInput } from '@/components/calculator/numeric-input';

interface TimeDepositFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .vault-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .vault-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #0F172A;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.3);
    transition: transform 0.1s;
  }
  .vault-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .tax-slider::-webkit-slider-thumb {
    border-color: #EF4444;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  }
  
  .vault-pattern {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.03) 10px,
      transparent 10px,
      transparent 20px
    );
  }
`;

export function TimeDepositForm({ calculator }: TimeDepositFormProps) {
  const [principal, setPrincipal] = useState<number>(100000);
  const [principalStr, setPrincipalStr] = useState<string>("100.000");
  
  const [interestRate, setInterestRate] = useState<number>(40);
  const [interestRateStr, setInterestRateStr] = useState<string>("40");
  
  const [maturityType, setMaturityType] = useState<'days' | 'months'>('days');
  const [maturity, setMaturity] = useState<number>(32);
  const [maturityStr, setMaturityStr] = useState<string>("32");

  const [taxRate, setTaxRate] = useState<number>(15);
  const [taxRateStr, setTaxRateStr] = useState<string>("15");

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, [maturityType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        principal,
        interestRate,
        maturityType,
        maturity,
        taxRate
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
    setInterestRateStr(e.target.value);
    const num = parseFloat(val);
    if (!isNaN(num)) setInterestRate(num);
  };
  const handleRateSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setInterestRate(num);
    setInterestRateStr(num.toString());
  };

  const handleMaturityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setMaturityStr("");
      setMaturity(0);
      return;
    }
    const num = parseInt(val, 10);
    setMaturity(num);
    setMaturityStr(num.toString());
  };
  const handleMaturitySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setMaturity(num);
    setMaturityStr(num.toString());
  };

  const handleTaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setTaxRateStr(e.target.value);
    const num = parseFloat(val);
    if (!isNaN(num)) setTaxRate(num);
  };
  const handleTaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setTaxRate(num);
    setTaxRateStr(num.toString());
  };

  // --- Data Extraction ---
  const data = result?.data || {};
  const netYieldStr = data.primaryResult || '0,00 ₺';
  const netYieldVal = parseFormattedNumber(netYieldStr);
  
  const secondary = data.secondaryResults || {};
  
  // Safe extraction to avoid encoding bugs
  const getSec = (keywords: string[], fallback: string) => {
    const key = Object.keys(secondary).find(k => keywords.some(word => k.toLowerCase().includes(word.toLowerCase())));
    return key ? secondary[key] : fallback;
  };

  const grossInterestStr = getSec(['Brüt', 'rüt', 'Faiz'], '0,00 ₺');
  const taxAmountStr = getSec(['Stopaj', 'Kesilen'], '0,00 ₺');
  const totalAmountStr = getSec(['Bakiye', 'Toplam', 'Sonu'], '0,00 ₺');
  const totalAmountVal = parseFormattedNumber(totalAmountStr);
  const effectiveYieldStr = getSec(['Efektif', 'Dönem'], '%0,00');
  const daysStr = getSec(['Esas', 'Gün'], '0 Gün');
  
  const notes = data.notes || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - GİRDİLER */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                Vadeli Mevduat Faizi
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Paranızı kilitli bir vade boyunca değerlendirerek brüt faizden stopaj düşüldükten sonra net kazancı hesaplayın.
              </p>
            </div>

            <div className="space-y-7">
              
              {/* PRINCIPAL */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Anapara (Yatırılan Tutar)</label>
                  <div className="relative">
                    <NumericInput isInteger={true}
                      value={principalStr}
                      onChange={handlePrincipalInputChange}
                      onBlur={handleCalculate}
                      className="w-40 px-4 py-2.5 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">₺</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={1000}
                  max={5000000}
                  step={1000}
                  value={principal}
                  onChange={handlePrincipalSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="vault-slider"
                  style={{
                    background: `linear-gradient(to right, #0F172A 0%, #0F172A ${(principal - 1000) / (5000000 - 1000) * 100}%, #E2E8F0 ${(principal - 1000) / (5000000 - 1000) * 100}%, #E2E8F0 100%)`
                  }}
                />
              </div>

              {/* INTEREST RATE */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Yıllık Faiz Oranı</label>
                  <div className="relative">
                    <NumericInput isInteger={false}
                      value={interestRateStr}
                      onChange={handleRateInputChange}
                      onBlur={handleCalculate}
                      className="w-32 px-4 py-2.5 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">%</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={interestRate}
                  onChange={handleRateSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="vault-slider"
                  style={{
                    background: `linear-gradient(to right, #0F172A 0%, #0F172A ${interestRate}%, #E2E8F0 ${interestRate}%, #E2E8F0 100%)`
                  }}
                />
              </div>

              {/* MATURITY (VADE) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Vade Kilit Süresi</label>
                  <div className="flex items-center gap-2">
                    <NumericInput isInteger={true}
                      value={maturityStr}
                      onChange={handleMaturityInputChange}
                      onBlur={handleCalculate}
                      className="w-20 px-4 py-2.5 text-center bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                    <div className="flex bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => { setMaturityType('days'); setMaturity(32); setMaturityStr('32'); }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${maturityType === 'days' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Gün
                      </button>
                      <button
                        onClick={() => { setMaturityType('months'); setMaturity(1); setMaturityStr('1'); }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${maturityType === 'months' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Ay
                      </button>
                    </div>
                  </div>
                </div>
                <input 
                  type="range"
                  min={1}
                  max={maturityType === 'days' ? 400 : 60}
                  step={1}
                  value={maturity}
                  onChange={handleMaturitySliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="vault-slider"
                  style={{
                    background: `linear-gradient(to right, #0F172A 0%, #0F172A ${(maturity - 1) / ((maturityType === 'days' ? 400 : 60) - 1) * 100}%, #E2E8F0 ${(maturity - 1) / ((maturityType === 'days' ? 400 : 60) - 1) * 100}%, #E2E8F0 100%)`
                  }}
                />
              </div>

              {/* TAX RATE (STOPAJ) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    Stopaj Oranı
                  </label>
                  <div className="relative">
                    <NumericInput isInteger={false}
                      value={taxRateStr}
                      onChange={handleTaxInputChange}
                      onBlur={handleCalculate}
                      className="w-24 px-4 py-2.5 pr-8 text-right bg-[#FEF2F2] border border-red-200 rounded-xl font-bold text-red-700 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 font-medium pointer-events-none">%</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={40}
                  step={0.5}
                  value={taxRate}
                  onChange={handleTaxSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="vault-slider tax-slider"
                  style={{
                    background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${taxRate / 40 * 100}%, #E2E8F0 ${taxRate / 40 * 100}%, #E2E8F0 100%)`
                  }}
                />
              </div>

            </div>

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

          {/* RIGHT COLUMN - VAULT & CASCADE */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* BANK VAULT CARD (NET ŞELALESİ) */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <div className="vault-pattern absolute inset-0 opacity-40 pointer-events-none"></div>
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <Landmark className="w-48 h-48 text-white" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 mb-4 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Net Kazanç</span>
                </div>
                
                <div className="text-5xl sm:text-6xl font-black text-emerald-400 flex items-baseline gap-2 drop-shadow-sm">
                  {isMounted ? (
                    <NumberFlow 
                      value={netYieldVal}
                      format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatThousands(netYieldVal)}</span>
                  )}
                  <span className="text-3xl font-bold opacity-80">₺</span>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-800 rounded-lg text-slate-400 text-sm font-semibold border border-slate-700">
                    Kilitli Vade: <span className="text-white">{maturity} {maturityType === 'days' ? 'Gün' : 'Ay'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GROSS TO NET CASCADE (BRÜT -> NET ŞELALESİ) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Brüt Kazançtan Net Kazanca</h3>
              
              <div className="max-w-xs mx-auto space-y-2 relative">
                {/* Decorative dashed line behind */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200 -z-10"></div>
                
                {/* Row 1: Gross */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl relative z-0">
                  <div className="w-4 h-4 rounded-full bg-slate-300 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Brüt Faiz Getirisi</div>
                    <div className="text-lg font-bold text-slate-700">{grossInterestStr}</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-start pl-[22px] py-1">
                  <ArrowDown className="w-4 h-4 text-slate-300" />
                </div>

                {/* Row 2: Tax */}
                <div className="flex items-center gap-4 bg-red-50 border border-red-100 p-4 rounded-2xl relative z-0">
                  <div className="w-4 h-4 rounded-full bg-red-400 flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px]">-</div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-red-500 uppercase">Kesilen Stopaj (%{taxRate})</div>
                    <div className="text-lg font-bold text-red-600">-{taxAmountStr}</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-start pl-[22px] py-1">
                  <ArrowDown className="w-4 h-4 text-slate-300" />
                </div>

                {/* Row 3: Net */}
                <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl relative z-0 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px]">=</div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-emerald-600 uppercase">Net Kazanç</div>
                    <div className="text-xl font-black text-emerald-700">{netYieldStr}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTAL BALANCE CARD */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-blue-100 font-semibold text-sm uppercase tracking-wider mb-1">Vade Sonu Toplam Bakiye</h4>
                <p className="text-blue-200/80 text-xs">Anapara + Net Kazanç Toplamınız</p>
              </div>
              <div className="text-3xl sm:text-4xl font-black">
                {isMounted ? (
                  <NumberFlow 
                    value={totalAmountVal}
                    format={{ style: 'decimal', maximumFractionDigits: 2 }}
                  />
                ) : (
                  <span>{formatThousands(totalAmountVal)}</span>
                )}
                <span className="text-xl opacity-80 font-bold ml-1">₺</span>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Yatırılan Tutar</div>
                <div className="font-bold text-slate-800 text-sm">{formatThousands(principal)} ₺</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Brüt Faiz Oranı</div>
                <div className="font-bold text-slate-800 text-sm">%{interestRate}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Net Dönem Getirisi</div>
                <div className="font-bold text-emerald-600 text-sm">{effectiveYieldStr}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Geçen Süre</div>
                <div className="font-bold text-slate-800 text-sm">{daysStr}</div>
              </div>
            </div>

            {/* LEGAL NOTES / INFO */}
            {notes && notes.length > 0 && (
              <div className="w-full flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-slate-600 mt-2">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                <div className="space-y-2">
                  {notes.map((note: string, idx: number) => (
                    <p key={idx} className="text-[11px] leading-relaxed font-medium">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    
      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}


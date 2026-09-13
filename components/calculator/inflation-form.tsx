'use client';

import { CalculatorSubmitButton } from './calculator-submit-button';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { TrendingUp, Info, ArrowRight } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface InflationFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .striped-bg {
    background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
    background-size: 1rem 1rem;
  }
`;

const formatDateLabel = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 7) return dateStr;
  const [year, month] = dateStr.split('-');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${year} ${months[parseInt(month) - 1]}`;
};

export function InflationForm({ calculator }: InflationFormProps) {
  const [startAmount, setStartAmount] = useState<number>(250000);
  const [startAmountStr, setStartAmountStr] = useState<string>("250.000");
  
  const [startDate, setStartDate] = useState<string>("2018-01");
  const [endDate, setEndDate] = useState<string>("2026-08");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    if (startDate > endDate) {
      setErrorMsg("Başlangıç tarihi bitiş tarihinden ileri olamaz.");
      setResult(null);
      return;
    }
    
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        startAmount,
        startDate,
        endDate
      });

      if (res.success) {
        setResult(res);
      } else if (res.errors && res.errors.length > 0) {
        setErrorMsg(res.errors[0]);
        setResult(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Hesaplama sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseFormattedNumber = (str: string) => {
    if (!str) return 0;
    const clean = str.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR').format(num);

  const handleStartAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setStartAmountStr("");
      setStartAmount(0);
      return;
    }
    const num = parseInt(val, 10);
    setStartAmount(num);
    setStartAmountStr(formatThousands(num));
  };

  const originalAmountStr = result?.data?.secondaryResults?.['Başlangıç Tutarı'] || `${formatThousands(startAmount)} ₺`;
  const finalAmountStr = result?.data?.primaryResult || '0,00 ₺';
  const finalAmountVal = parseFormattedNumber(finalAmountStr);
  const priceIncreaseStr = result?.data?.secondaryResults?.['Değer Artışı'] || '0,00 ₺';
  const inflationRateStr = result?.data?.secondaryResults?.['TÜFE Değişimi'] || '%0,00';
  const startIdxStr = result?.data?.secondaryResults?.['Başlangıç Endeksi'] || '-';
  const endIdxStr = result?.data?.secondaryResults?.['Bitiş Endeksi'] || '-';
  
  const isDeflation = inflationRateStr.includes('-');
  const startRatio = (finalAmountVal > 0 && !isDeflation) ? Math.min(100, Math.max(0, (startAmount / finalAmountVal) * 100)) : 100;
  const increaseRatio = (finalAmountVal > 0 && !isDeflation) ? Math.max(0, 100 - startRatio) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - INTERACTION */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                Enflasyon Hesaplama
              </h2>
              <p className="text-slate-500 font-medium">Paranın alım gücünü yıllara göre kıyaslayın.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Başlangıç Tutarı (TL)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={startAmountStr}
                    onChange={handleStartAmountInputChange}
                    onBlur={handleCalculate}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl font-bold text-xl text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all pl-12"
                    placeholder="0"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₺</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Başlangıç Tarihi</label>
                  <input 
                    type="month"
                    min="2003-01"
                    max="2026-08"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={handleCalculate}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Bitiş Tarihi</label>
                  <input 
                    type="month"
                    min="2003-01"
                    max="2026-08"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={handleCalculate}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-xl border border-red-100">
                  {errorMsg}
                </div>
              )}
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

          {/* RIGHT COLUMN - BEFORE/AFTER & BUILD-UP BAR */}
          <div className="lg:col-span-7 flex flex-col justify-center h-full space-y-8">
            
            {/* BEFORE / AFTER CARDS */}
            <div className="relative flex flex-col sm:flex-row items-stretch justify-between gap-4">
              
              {/* LEFT CARD: START */}
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Başlangıç Tutarı</span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-700">
                  {originalAmountStr}
                </div>
                <span className="text-xs font-medium text-slate-400 mt-1">{formatDateLabel(startDate)}</span>
              </div>

              {/* CENTER BADGE */}
              <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-md border-2 border-white flex items-center gap-1 ${isDeflation ? 'bg-emerald-100 text-emerald-700' : 'bg-red-500 text-white'}`}>
                  {!isDeflation && <span className="opacity-80">+</span>}
                  {inflationRateStr}
                </div>
              </div>
              
              {/* MOBILE ONLY ARROW */}
              <div className="sm:hidden flex justify-center -my-2 z-0">
                 <ArrowRight className="w-6 h-6 text-slate-300 rotate-90" />
              </div>

              {/* RIGHT CARD: FINAL */}
              <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Enflasyon Sonrası Tutar</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-baseline gap-1">
                  {isMounted ? (
                    <NumberFlow 
                      value={finalAmountVal}
                      format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatThousands(finalAmountVal)}</span>
                  )}
                  <span className="text-xl font-medium text-slate-600">₺</span>
                </div>
                <span className="text-xs font-medium text-red-400 mt-1">{formatDateLabel(endDate)}</span>
              </div>
            </div>

            {/* TIMELINE VIEW */}
            <div className="flex items-center justify-center gap-4 text-slate-500 font-semibold bg-slate-50 py-2 px-4 rounded-full border border-slate-100 w-fit mx-auto">
              <span>{formatDateLabel(startDate)}</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-800">{formatDateLabel(endDate)}</span>
            </div>

            {/* INFLATION BUILD-UP BAR */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Enflasyonun Tutar Üzerindeki Etkisi</h3>
              
              <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
                <div 
                  className="h-full bg-slate-800 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white/90 overflow-hidden" 
                  style={{ width: `${startRatio}%` }}
                  title="Başlangıç Değeri"
                >
                  {startRatio > 15 ? 'ANA PARA' : ''}
                </div>
                <div 
                  className="h-full bg-red-500 striped-bg transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white/90 overflow-hidden" 
                  style={{ width: `${increaseRatio}%` }}
                  title="Fiyat Artışı (Enflasyon Köpüğü)"
                >
                  {increaseRatio > 15 ? 'ENFLASYON FARKI' : ''}
                </div>
              </div>
              
              <div className="flex justify-between items-start mt-3 px-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                    <span className="text-xs font-semibold text-slate-600">Başlangıç Değeri</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 pl-4">{originalAmountStr}</span>
                </div>
                
                {!isDeflation && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-slate-600">Değer Artışı</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    </div>
                    <span className="text-[11px] font-bold text-red-500 pr-4">+{priceIncreaseStr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Baş. Endeksi</div>
                <div className="font-bold text-slate-800">{startIdxStr}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Bit. Endeksi</div>
                <div className="font-bold text-slate-800">{endIdxStr}</div>
              </div>
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
    
      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { ArrowLeftRight, Loader2, Info, ArrowDown, Banknote } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface CurrencyFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .curr-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .curr-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #3B82F6;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    transition: transform 0.1s;
  }
  .curr-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .curr-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #3B82F6;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    transition: transform 0.1s;
  }
  .curr-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
`;

const CURRENCY_OPTIONS = [
  "USD", "EUR", "GBP", "CHF", "CAD", "RUB", "AED", "AUD", 
  "DKK", "SEK", "NOK", "JPY", "KWD", "SAR", "CNY"
];

export function CurrencyForm({ calculator }: CurrencyFormProps) {
  const [transactionType, setTransactionType] = useState<'to_currency' | 'to_try'>('to_currency');
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  
  const [cashAmount, setCashAmount] = useState<number>(35000);
  const [cashAmountStr, setCashAmountStr] = useState<string>("35.000");
  
  const [quantity, setQuantity] = useState<number>(1000);
  const [quantityStr, setQuantityStr] = useState<string>("1.000");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, [transactionType, currencyCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        currencyCode,
        transactionType,
        quantity,
        cashAmount
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

  const handleCashInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setCashAmountStr("");
      setCashAmount(0);
      return;
    }
    const num = parseInt(val, 10);
    setCashAmount(num);
    setCashAmountStr(formatThousands(num));
  };

  const handleCashSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setCashAmount(num);
    setCashAmountStr(formatThousands(num));
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setQuantityStr("");
      setQuantity(0);
      return;
    }
    const num = parseInt(val, 10);
    setQuantity(num);
    setQuantityStr(formatThousands(num));
  };

  const handleQuantitySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setQuantity(num);
    setQuantityStr(formatThousands(num));
  };

  const isToTry = transactionType === 'to_try';
  
  const resultValue = result?.data?.primaryResult ? parseFormattedNumber(result.data.primaryResult) : 0;
  
  const rateString = isToTry
    ? result?.data?.secondaryResults?.['Piyasa Kuru (Alış)']
    : result?.data?.secondaryResults?.['Piyasa Kuru (Satış)'];

  const givenAmount = isToTry ? quantity : cashAmount;
  const givenSymbol = isToTry ? currencyCode : 'TL';
  const receivedSymbol = isToTry ? 'TL' : currencyCode;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - INTERACTION */}
          <div className="lg:col-span-6 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                Döviz Çevirici
              </h2>
              <p className="text-slate-500">Anlık piyasa kurları üzerinden TL → döviz dönüşümü yapın.</p>
            </div>

            <div className="space-y-8">
              {/* SEGMENTED CONTROL */}
              <div className="bg-slate-100/80 p-1.5 rounded-2xl flex relative w-full">
                <button
                  onClick={() => setTransactionType('to_try')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${isToTry ? 'text-blue-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Döviz Bozuyorum
                </button>
                <button
                  onClick={() => setTransactionType('to_currency')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${!isToTry ? 'text-blue-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Döviz Alıyorum
                </button>
              </div>

              {/* CURRENCY TYPE */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-blue-500" />
                  Döviz Cinsi
                </label>
                <div className="relative">
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* DYNAMIC INPUT */}
              {!isToTry ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700">TL Tutarı</label>
                    <div className="relative">
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={cashAmountStr}
                        onChange={handleCashInputChange}
                        onBlur={handleCalculate}
                        className="w-40 px-4 py-2 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">TL</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min={100}
                    max={1000000}
                    step={100}
                    value={cashAmount}
                    onChange={handleCashSliderChange}
                    onMouseUp={handleCalculate}
                    onTouchEnd={handleCalculate}
                    className="curr-slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(cashAmount - 100) / (1000000 - 100) * 100}%, #E2E8F0 ${(cashAmount - 100) / (1000000 - 100) * 100}%, #E2E8F0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>100 TL</span>
                    <span>1 Milyon TL</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700">Döviz Miktarı</label>
                    <div className="relative">
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={quantityStr}
                        onChange={handleQuantityInputChange}
                        onBlur={handleCalculate}
                        className="w-40 px-4 py-2 pr-14 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">{currencyCode}</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min={10}
                    max={100000}
                    step={10}
                    value={quantity}
                    onChange={handleQuantitySliderChange}
                    onMouseUp={handleCalculate}
                    onTouchEnd={handleCalculate}
                    className="curr-slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(quantity - 10) / (100000 - 10) * 100}%, #E2E8F0 ${(quantity - 10) / (100000 - 10) * 100}%, #E2E8F0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>10 {currencyCode}</span>
                    <span>100.000 {currencyCode}</span>
                  </div>
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

          {/* RIGHT COLUMN - DUAL CURRENCY CARD */}
          <div className="lg:col-span-6 flex flex-col justify-center h-full space-y-6">
            
            <div className="relative">
              {/* TOP CARD: GIVEN AMOUNT */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] rounded-b-xl p-8 flex flex-col items-center justify-center relative pb-12">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Verilen Tutar</span>
                <div className="text-4xl font-bold text-slate-800 flex items-baseline gap-2">
                  {isMounted ? (
                    <NumberFlow 
                      value={givenAmount}
                      format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatThousands(givenAmount)}</span>
                  )}
                  <span className="text-2xl text-slate-400 font-medium">{givenSymbol}</span>
                </div>
              </div>
              
              {/* MIDDLE BADGE: EXCHANGE RATE */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="bg-white border-4 border-white shadow-md rounded-full p-2 mb-1">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                    <ArrowDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 text-xs font-bold text-slate-600 whitespace-nowrap">
                  1 {currencyCode} ➔ TL
                </div>
              </div>

              {/* BOTTOM CARD: RECEIVED AMOUNT */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-500 rounded-[2rem] rounded-t-xl p-8 flex flex-col items-center justify-center text-white pt-16 shadow-xl shadow-indigo-600/20">
                <span className="text-sm font-semibold text-violet-200 uppercase tracking-wider mb-2">Alınan Tutar</span>
                <div className="text-5xl font-extrabold flex items-baseline gap-2">
                  {isMounted ? (
                    <NumberFlow 
                      value={resultValue}
                      format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatThousands(resultValue)}</span>
                  )}
                  <span className="text-3xl font-medium opacity-80">{receivedSymbol}</span>
                </div>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="space-y-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">İşlem Yönü</span>
                <span className="text-sm font-bold text-slate-800">
                  {result?.data?.secondaryResults?.['İşlem Yönü'] || (isToTry ? `${currencyCode} ➔ TL` : `TL ➔ ${currencyCode}`)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Döviz Cinsi</span>
                <span className="text-sm font-bold text-slate-800">
                  {currencyCode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Kullanılan Kur</span>
                <span className="text-sm font-bold text-blue-600">
                  {rateString || '-'}
                </span>
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
    </div>
  );
}


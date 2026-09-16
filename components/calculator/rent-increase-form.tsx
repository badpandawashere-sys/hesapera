'use client';

import { CalculatorSubmitButton } from './calculator-submit-button';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { Home, Loader2, Info, ReceiptText } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface RentIncreaseFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .rent-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .rent-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #0F172A;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
    transition: transform 0.1s;
  }
  .rent-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .rent-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #0F172A;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
    transition: transform 0.1s;
  }
  .rent-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
  
  .receipt-edge {
    background-image: radial-gradient(circle at 10px 0, transparent 10px, #0F172A 11px);
    background-size: 24px 12px;
    background-repeat: repeat-x;
    height: 12px;
    width: 100%;
    position: absolute;
    bottom: -11px;
    left: 0;
    z-index: 10;
  }
`;

export function RentIncreaseForm({ calculator }: RentIncreaseFormProps) {
  const [currentRent, setCurrentRent] = useState<number>(10000);
  const [currentRentStr, setCurrentRentStr] = useState<string>("10.000");
  
  const [increaseRate, setIncreaseRate] = useState<number>(25);
  const [increaseRateStr, setIncreaseRateStr] = useState<string>("25");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        currentRent,
        increaseRate
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
  const handleRentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      setCurrentRentStr("");
      setCurrentRent(0);
      return;
    }
    const num = parseInt(val, 10);
    setCurrentRent(num);
    setCurrentRentStr(formatThousands(num));
  };
  const handleRentSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setCurrentRent(num);
    setCurrentRentStr(formatThousands(num));
  };

  const handleRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setIncreaseRateStr(e.target.value);
    const num = parseFloat(val);
    if (!isNaN(num)) setIncreaseRate(num);
  };
  const handleRateSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setIncreaseRate(num);
    setIncreaseRateStr(num.toString());
  };

  // --- Data Extraction ---
  const newRentStr = result?.data?.primaryResult || '0,00 ₺';
  const newRentVal = parseFormattedNumber(newRentStr);
  
  // Notice the backend sends 'Mevcut Kira', 'Artış Tutarı', 'Artış Oranı'
  // But definition has encoding issues ('ArtY Tutar', 'ArtY Oran'). 
  // We'll safely check standard names or fallback to calculated defaults just in case.
  const secondary = result?.data?.secondaryResults || {};
  const oldRentStr = secondary['Mevcut Kira'] || `${formatThousands(currentRent)} ₺`;
  
  // Find key that contains "Tutar" for increase amount
  const incAmountKey = Object.keys(secondary).find(k => k.includes('Tutar')) || 'Artış Tutarı';
  const increaseAmountStr = secondary[incAmountKey] || `${formatThousands(currentRent * (increaseRate / 100))} ₺`;
  
  // Find key that contains "Oran" for rate
  const incRateKey = Object.keys(secondary).find(k => k.includes('Oran')) || 'Artış Oranı';
  const increaseRateDisplay = secondary[incRateKey] || `%${increaseRate}`;

  const notes = (result?.data as any)?.notes || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - GİRDİLER */}
          <div className="lg:col-span-6 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-xl shadow-sm">
                  <Home className="w-6 h-6" />
                </div>
                Kira Artış Oranı
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Mevcut kira bedeliniz ve yüzdesel zam oranı üzerinden yeni dönemde ödeyeceğiniz aylık kira bedelini hesaplayın.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* CURRENT RENT */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Mevcut Kira Bedeli</label>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={currentRentStr}
                      onChange={handleRentInputChange}
                      onBlur={handleCalculate}
                      className="w-40 px-4 py-2.5 pr-10 text-right bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">₺</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={1000}
                  max={250000}
                  step={500}
                  value={currentRent}
                  onChange={handleRentSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="rent-slider"
                  style={{
                    background: `linear-gradient(to right, #0F172A 0%, #0F172A ${(currentRent - 1000) / (250000 - 1000) * 100}%, #E2E8F0 ${(currentRent - 1000) / (250000 - 1000) * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>1.000 ₺</span>
                  <span>250.000 ₺</span>
                </div>
              </div>

              {/* INCREASE RATE */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Artış Oranı</label>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="decimal"
                      value={increaseRateStr}
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
                  max={200}
                  step={1}
                  value={increaseRate}
                  onChange={handleRateSliderChange}
                  onMouseUp={handleCalculate}
                  onTouchEnd={handleCalculate}
                  className="rent-slider"
                  style={{
                    background: `linear-gradient(to right, #0F172A 0%, #0F172A ${increaseRate / 200 * 100}%, #E2E8F0 ${increaseRate / 200 * 100}%, #E2E8F0 100%)`
                  }}
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>%0</span>
                  <span>%200</span>
                </div>
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

          {/* RIGHT COLUMN - CONTRACT BILL / RENT RECEIPT */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center h-full">
            
            {/* THE RECEIPT CARD */}
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative flex flex-col">
              
              {/* Receipt Header */}
              <div className="bg-slate-900 px-6 py-8 relative">
                <div className="receipt-edge"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400/80">
                    <ReceiptText className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Kira Hesap Dökümü</span>
                  </div>
                </div>
                
                <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-1">Yeni Kira Bedeli</h3>
                <div className="text-4xl sm:text-5xl font-black text-white flex items-baseline gap-2">
                  {isMounted ? (
                    <NumberFlow 
                      value={newRentVal}
                      format={{ style: 'decimal', maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{formatThousands(newRentVal)}</span>
                  )}
                  <span className="text-2xl font-bold text-emerald-400 opacity-90">₺</span>
                </div>
              </div>

              {/* Receipt Body (Math Breakdown) */}
              <div className="px-6 py-8 bg-[#F8FAFC] space-y-6">
                
                {/* Existing Rent */}
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium text-sm">Mevcut Kira Bedeli</span>
                  <span className="font-bold text-slate-800 text-lg">{oldRentStr}</span>
                </div>

                {/* Increase Amount */}
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium text-sm flex items-center gap-2">
                    Artış Tutarı
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[11px] font-bold">
                      +{increaseRateDisplay}
                    </span>
                  </span>
                  <span className="font-bold text-orange-600 text-lg">+{increaseAmountStr}</span>
                </div>

                {/* Separator */}
                <div className="w-full border-t-2 border-dashed border-slate-300 my-2 relative">
                  <div className="absolute -left-8 -top-3 w-6 h-6 rounded-full bg-white shadow-inner"></div>
                  <div className="absolute -right-8 -top-3 w-6 h-6 rounded-full bg-white shadow-inner"></div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-900">Yeni Dönem Aylık Ödeme</span>
                  <span className="font-black text-emerald-600 text-xl">{newRentStr}</span>
                </div>

              </div>

            </div>

            {/* LEGAL NOTES / WARNINGS */}
            {notes && notes.length > 0 && (
              <div className="mt-6 w-full max-w-md flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-600">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                <div className="space-y-2">
                  {notes.map((note: string, idx: number) => (
                    <p key={idx} className="text-xs leading-relaxed font-medium">
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




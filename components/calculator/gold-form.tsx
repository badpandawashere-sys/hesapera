'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { ArrowRightLeft, Loader2, Info, Coins, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface GoldFormProps {
  calculator: CalculatorViewModel;
}

const sliderStyles = `
  .gold-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    background: #E2E8F0;
    outline: none;
  }
  .gold-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #F59E0B;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
    transition: transform 0.1s;
  }
  .gold-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  .gold-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #F59E0B;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
    transition: transform 0.1s;
  }
  .gold-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }
`;

const INSTRUMENT_OPTIONS = [
  "Gram Altın",
  "Çeyrek Altın",
  "Yarım Altın",
  "Tam Altın",
  "Ata Altın",
  "Gremse Altın",
  "Gümüş"
];

export function GoldForm({ calculator }: GoldFormProps) {
  const [transactionType, setTransactionType] = useState<'to_gold' | 'to_cash'>('to_gold');
  const [instrumentType, setInstrumentType] = useState<string>("Gram Altın");
  
  const [cashAmount, setCashAmount] = useState<number>(10000);
  const [cashAmountStr, setCashAmountStr] = useState<string>("10.000");
  
  const [quantity, setQuantity] = useState<number>(10);
  const [quantityStr, setQuantityStr] = useState<string>("10");

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, [transactionType, instrumentType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      // Çift istek atarak hem alış hem satış kurlarını alıyoruz (Business logic değiştirmeden UI'da göstermek için)
      const oppositeType = transactionType === 'to_cash' ? 'to_gold' : 'to_cash';
      
      const [res, resOpposite] = await Promise.all([
        calculateAction(calculator.slug, {
          instrumentType,
          transactionType,
          quantity,
          cashAmount
        }),
        calculateAction(calculator.slug, {
          instrumentType,
          transactionType: oppositeType,
          quantity: 1,
          cashAmount: 1000
        })
      ]);

      if (res.success) {
        setResult(res);
        
        let bPrice = "";
        let sPrice = "";

        if (transactionType === 'to_cash') {
          bPrice = res?.data?.secondaryResults?.['Kullanılan Kur (Alış)'] || '';
          sPrice = resOpposite?.data?.secondaryResults?.['Kullanılan Kur (Satış)'];
        } else {
          sPrice = res?.data?.secondaryResults?.['Kullanılan Kur (Satış)'] || '';
          bPrice = resOpposite?.data?.secondaryResults?.['Kullanılan Kur (Alış)'];
        }

        if (bPrice) setBuyPrice(bPrice);
        if (sPrice) setSellPrice(sPrice);
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

  const handleSwap = () => {
    setTransactionType(prev => prev === 'to_gold' ? 'to_cash' : 'to_gold');
  };

  const resultValue = result?.data?.primaryResult ? parseFormattedNumber(result.data.primaryResult) : 0;
  
  // Format based on transaction type
  const isToCash = transactionType === 'to_cash';
  const unitLabel = isToCash ? "₺" : (instrumentType.includes('Gram') || instrumentType.includes('Gümüş') ? 'Gram' : 'Adet');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - INTERACTION */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                Altın Çevirici
              </h2>
              <p className="text-slate-500">Canlı kurlar üzerinden altın alış ve satış hesaplamalarınızı yapın.</p>
            </div>

            <div className="space-y-8">
              {/* SEGMENTED CONTROL */}
              <div className="bg-slate-100/80 p-1.5 rounded-2xl flex relative w-full">
                <button
                  onClick={() => setTransactionType('to_gold')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${!isToCash ? 'text-amber-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Altın Alıyorum
                </button>
                <button
                  onClick={() => setTransactionType('to_cash')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${isToCash ? 'text-amber-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Altın Satıyorum
                </button>
              </div>

              {/* INSTRUMENT SELECTOR */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Altın Türü</label>
                <select
                  value={instrumentType}
                  onChange={e => setInstrumentType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                >
                  {INSTRUMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* AMOUNT INPUT */}
              {!isToCash ? (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Tutar (₺)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cashAmountStr}
                    onChange={handleCashInputChange}
                    onBlur={handleCalculate}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    placeholder="10.000"
                  />
                  <input type="range" min={1000} max={1000000} step={1000} value={cashAmount} onChange={handleCashSliderChange} onMouseUp={handleCalculate} onTouchEnd={handleCalculate} className="gold-slider w-full mt-3" />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Miktar (Adet/Gram)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantityStr}
                    onChange={handleQuantityInputChange}
                    onBlur={handleCalculate}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    placeholder="10"
                  />
                  <input type="range" min={1} max={500} step={1} value={quantity} onChange={handleQuantitySliderChange} onMouseUp={handleCalculate} onTouchEnd={handleCalculate} className="gold-slider w-full mt-3" />
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

          {/* RIGHT COLUMN - RESULTS & QUOTE BOARD */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-[2rem] p-8 relative overflow-hidden flex flex-col h-full border border-amber-100">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              
              <div className="mb-8 text-center">
                <h3 className="text-amber-700 font-semibold text-sm tracking-wider uppercase mb-2">
                  {isToCash ? "Toplam Değer" : "Alınabilecek Miktar"}
                </h3>
                <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-baseline justify-center gap-2">
                  {isMounted ? (
                    <NumberFlow 
                      value={resultValue}
                      format={isToCash ? { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 } : { maximumFractionDigits: 2 }}
                    />
                  ) : (
                    <span>{isToCash ? formatThousands(resultValue) : formatThousands(resultValue)}</span>
                  )}
                  {!isToCash && <span className="text-2xl text-slate-500 font-medium">{unitLabel}</span>}
                </div>
              </div>

              {/* MARKET QUOTE BOARD */}
              <div className="bg-white rounded-2xl p-5 border border-amber-200/50 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Kur Levhası
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">Canlı</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-xl border ${isToCash ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
                    <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Banka Alış
                    </div>
                    <div className={`font-bold ${isToCash ? 'text-amber-700' : 'text-slate-800'}`}>{buyPrice || '-'}</div>
                    {isToCash && <div className="text-[10px] text-amber-600 mt-0.5 font-semibold">Kullanılan Kur</div>}
                  </div>
                  
                  <div className={`p-3 rounded-xl border ${!isToCash ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
                    <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Banka Satış
                    </div>
                    <div className={`font-bold ${!isToCash ? 'text-amber-700' : 'text-slate-800'}`}>{sellPrice || '-'}</div>
                    {!isToCash && <div className="text-[10px] text-amber-600 mt-0.5 font-semibold">Kullanılan Kur</div>}
                  </div>
                </div>

                {/* SPREAD BAR */}
                <div className="relative pt-2 pb-1">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="w-1/2 bg-amber-400 opacity-60"></div>
                    <div className="w-1/2 bg-emerald-400 opacity-60"></div>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-200 shadow-sm">
                    MAKAS
                  </div>
                </div>
              </div>

              {/* SUMMARY TABLE */}
              <div className="space-y-3 mb-6 bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/60">
                <div className="flex justify-between items-center pb-2.5 border-b border-amber-100/60">
                  <span className="text-sm font-medium text-slate-500">İşlem Yönü</span>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['İşlem Yönü'] || (isToCash ? "Altından Paraya" : "Paradan Altına")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-amber-100/60">
                  <span className="text-sm font-medium text-slate-500">Altın Türü</span>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['Altın Türü'] || instrumentType}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-sm font-medium text-slate-500">{isToCash ? "Bozdurulan Miktar" : "Ödenen Tutar"}</span>
                  <span className="text-sm font-bold text-slate-900">
                    {result?.data?.secondaryResults?.['Miktar'] || result?.data?.secondaryResults?.['Para Tutarı'] || (isToCash ? `${quantity} ${unitLabel}` : `${formatThousands(cashAmount)} ₺`)}
                  </span>
                </div>
              </div>

              {/* INFO REFERENCE */}
              {result?.data?.infoReference && (
                <div className="mt-auto flex items-start gap-3 bg-blue-50/70 backdrop-blur-sm border border-blue-100/50 p-4 rounded-2xl text-blue-800">
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
    
      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}




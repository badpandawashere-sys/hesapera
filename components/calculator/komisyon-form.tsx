'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Calculator, ArrowRight, Wallet, Percent, Target } from 'lucide-react';
import NumberFlow from '@number-flow/react';


const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function KomisyonForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [mod, setMod] = useState<'calculate_commission' | 'calculate_target_gross' | 'calculate_rate'>('calculate_commission');
  
  const [grossAmount, setGrossAmount] = useState<number>(1000);
  const [grossAmountStr, setGrossAmountStr] = useState<string>('1.000,00');

  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [commissionRateStr, setCommissionRateStr] = useState<string>('10,00');

  const [targetNet, setTargetNet] = useState<number>(900);
  const [targetNetStr, setTargetNetStr] = useState<string>('900,00');

  const [commissionAmount, setCommissionAmount] = useState<number>(100);
  const [commissionAmountStr, setCommissionAmountStr] = useState<string>('100,00');

  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const parseFormattedStr = (str: string): number | null => {
    if (!str) return null;
    const normalized = str.replace(/\./g, '').replace(/,/g, '.');
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  };

  const makeNumberHandler = (
    setStr: (s: string) => void, 
    setVal: (v: number) => void
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,-]/g, '');
    setStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && parsed >= 0) {
      setVal(parsed);
    }
  };

  const handleBlur = (val: number, setStr: (s: string) => void) => () => {
    setStr(formatThousands(val));
  };

  useEffect(() => { 
    setMounted(true); 
    handleCalc(); 
  }, [mod, grossAmount, commissionRate, targetNet, commissionAmount]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, {
        mode: mod,
        grossAmount,
        commissionRate,
        targetNet,
        commissionAmount
      });
      setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const isErr = res?.success === false;
  const errText = res?.errors?.[0];

  const renderModButton = (value: typeof mod, label: string, icon: React.ReactNode) => {
    const active = mod === value;
    return (
      <button
        onClick={() => setMod(value)}
        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all font-bold text-sm gap-2 relative overflow-hidden ${
          active 
          ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/50'
        }`}
      >
        {icon}
        {label}
        {active && (
          <div className="absolute inset-0 bg-white/10" />
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {renderModButton('calculate_commission', 'Komisyon Hesapla', <Calculator className="w-5 h-5"/>)}
        {renderModButton('calculate_target_gross', 'Netten Satış Fiyatı', <Target className="w-5 h-5"/>)}
        {renderModButton('calculate_rate', 'Oranı Bul', <Percent className="w-5 h-5"/>)}
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] p-2 shadow-xl border border-slate-200 mb-8">
        <div className="bg-white rounded-[2rem] p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
          
          <div className="space-y-6 flex flex-col justify-center">
            
            {mod === 'calculate_commission' && (
              <>
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Satış Tutarı</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={grossAmountStr} 
                        onChange={makeNumberHandler(setGrossAmountStr, setGrossAmount)} 
                        onBlur={handleBlur(grossAmount, setGrossAmountStr)}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">TL</span>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Komisyon Oranı</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={commissionRateStr} 
                        onChange={makeNumberHandler(setCommissionRateStr, setCommissionRate)} 
                        onBlur={handleBlur(commissionRate, setCommissionRateStr)}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">%</span>
                   </div>
                </div>
              </>
            )}

            {mod === 'calculate_target_gross' && (
              <>
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Hedef Net Tutar</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={targetNetStr} 
                        onChange={makeNumberHandler(setTargetNetStr, setTargetNet)} 
                        onBlur={handleBlur(targetNet, setTargetNetStr)}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">TL</span>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Komisyon Oranı</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={commissionRateStr} 
                        onChange={makeNumberHandler(setCommissionRateStr, setCommissionRate)} 
                        onBlur={handleBlur(commissionRate, setCommissionRateStr)}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">%</span>
                   </div>
                </div>
              </>
            )}

            {mod === 'calculate_rate' && (
              <>
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Satış Tutarı</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={grossAmountStr} 
                        onChange={makeNumberHandler(setGrossAmountStr, setGrossAmount)} 
                        onBlur={handleBlur(grossAmount, setGrossAmountStr)}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">TL</span>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Kesilen Komisyon Tutarı</label>
                   <div className="relative">
                      <input 
                        type="text" 
                        inputMode="decimal" 
                        value={commissionAmountStr} 
                        onChange={makeNumberHandler(setCommissionAmountStr, setCommissionAmount)} 
                        onBlur={handleBlur(commissionAmount, setCommissionAmountStr)}
                        className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">TL</span>
                   </div>
                </div>
              </>
            )}

          </div>

          <div className={`relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-center text-white transition-colors duration-500 ${isErr ? 'bg-rose-600' : 'bg-indigo-600'}`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            
            
              {isErr ? (
                <div>
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl font-black">!</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Hesaplama Hatası</h3>
                  <p className="text-rose-100 font-medium">{errText}</p>
                </div>
              ) : (
                <div>
                  
                  {mod === 'calculate_commission' && (
                    <div className="text-center">
                      <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2 flex items-center justify-center gap-2">
                        <Wallet className="w-4 h-4" /> Satıcıya Kalan Net Tutar {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                      </p>
                      <div className="text-5xl lg:text-6xl font-black drop-shadow-md mb-8 flex items-baseline justify-center gap-1">
                        {mounted ? <NumberFlow value={res?.data?.primaryResult?.netAmount || 0} format={{maximumFractionDigits:2}} /> : '0'} <span className="text-2xl font-bold text-indigo-200">TL</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-left">
                          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Komisyon Tutarı</p>
                          <p className="text-xl font-black">{mounted ? formatThousands(res?.data?.primaryResult?.commissionAmount || 0) : '0'} <span className="text-sm font-bold opacity-75">TL</span></p>
                        </div>
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-left">
                          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Komisyon Oranı</p>
                          <p className="text-xl font-black"><span className="text-sm font-bold opacity-75">%</span>{mounted ? formatThousands(res?.data?.primaryResult?.commissionRate || 0) : '0'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mod === 'calculate_target_gross' && (
                    <div className="text-center">
                      <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2 flex items-center justify-center gap-2">
                        <ArrowRight className="w-4 h-4" /> Gerekli Satış Fiyatı {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                      </p>
                      <div className="text-5xl lg:text-6xl font-black drop-shadow-md mb-8 flex items-baseline justify-center gap-1">
                        {mounted ? <NumberFlow value={res?.data?.primaryResult?.grossAmount || 0} format={{maximumFractionDigits:2}} /> : '0'} <span className="text-2xl font-bold text-indigo-200">TL</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-left">
                          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Komisyon Tutarı</p>
                          <p className="text-xl font-black">{mounted ? formatThousands(res?.data?.primaryResult?.commissionAmount || 0) : '0'} <span className="text-sm font-bold opacity-75">TL</span></p>
                        </div>
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-left">
                          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Hedef Net Tutar</p>
                          <p className="text-xl font-black">{mounted ? formatThousands(res?.data?.primaryResult?.netAmount || 0) : '0'} <span className="text-sm font-bold opacity-75">TL</span></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mod === 'calculate_rate' && (
                    <div className="text-center">
                      <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2 flex items-center justify-center gap-2">
                        <Percent className="w-4 h-4" /> Komisyon Oranı {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                      </p>
                      <div className="text-5xl lg:text-6xl font-black drop-shadow-md mb-8 flex items-baseline justify-center gap-1">
                         <span className="text-2xl font-bold text-indigo-200">%</span>{mounted ? <NumberFlow value={res?.data?.primaryResult?.commissionRate || 0} format={{maximumFractionDigits:2}} /> : '0'}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-left">
                          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Komisyon Tutarı</p>
                          <p className="text-xl font-black">{mounted ? formatThousands(res?.data?.primaryResult?.commissionAmount || 0) : '0'} <span className="text-sm font-bold opacity-75">TL</span></p>
                        </div>
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 text-left">
                          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Net Tutar</p>
                          <p className="text-xl font-black">{mounted ? formatThousands(res?.data?.primaryResult?.netAmount || 0) : '0'} <span className="text-sm font-bold opacity-75">TL</span></p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            
          </div>

        </div>
      </div>
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

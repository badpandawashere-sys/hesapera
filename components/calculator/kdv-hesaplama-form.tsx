'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Calculator, Percent, ArrowRight, ArrowRightLeft, Plus, Minus } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function KdvHesaplamaForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [mod, setMod] = useState<'ekle' | 'cikar'>('ekle');
  
  const [tutar, setTutar] = useState<number>(1000);
  const [tutarStr, setTutarStr] = useState<string>('1.000,00');

  const [oran, setOran] = useState<number>(20);
  const [oranStr, setOranStr] = useState<string>('20');
  
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    handleCalc(); 
  }, [tutar, oran, mod]); // eslint-disable-line

  const handleCalc = async () => {
    if (tutar <= 0 || oran < 0) return;
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, { tutar, oran, mod });
      if (resp.success) setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const parseFormattedStr = (str: string): number | null => {
    if (!str) return null;
    const normalized = str.replace(/\./g, '').replace(/,/g, '.');
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  };

  const handleTutarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and comma
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setTutarStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && parsed >= 0) {
      setTutar(parsed);
    }
  };

  const handleTutarBlur = () => {
    const parsed = parseFormattedStr(tutarStr);
    if (parsed !== null && parsed >= 0) {
      setTutarStr(formatThousands(parsed));
    }
  };

  const handleOranChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setOranStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && parsed >= 0 && parsed <= 100) {
      setOran(parsed);
    }
  };
  
  const setPresetRate = (rate: number) => {
    setOran(rate);
    setOranStr(rate.toString());
  };

  const kdvHaric = res?.data?.secondaryResults?.['KDV Hariç Tutar'] || 0;
  const kdvTutari = res?.data?.secondaryResults?.['KDV Tutarı'] || 0;
  const kdvDahil = res?.data?.secondaryResults?.['KDV Dahil Tutar'] || 0;
  
  // Is custom selected?
  const isCustomRate = oran !== 1 && oran !== 10 && oran !== 20;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-slate-50 rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col gap-10">
        
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Calculator className="w-6 h-6"/></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">KDV HESAPLAMA</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">KDV oranına göre dahil veya hariç tutarı hesaplayın</p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-200 p-1 rounded-2xl relative w-full md:w-3/4 lg:w-1/2 mx-auto">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow transition-all duration-300 ease-out z-0 ${mod === 'cikar' ? 'translate-x-full ml-1' : ''}`}
          ></div>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm relative z-10 transition-colors ${mod === 'ekle' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('ekle')}
          >
            <Plus className="w-4 h-4" /> KDV Ekle
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm relative z-10 transition-colors ${mod === 'cikar' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('cikar')}
          >
            <Minus className="w-4 h-4" /> KDV Çıkar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-emerald-500 transition-colors relative">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">{mod === 'ekle' ? 'KDV Hariç Tutar' : 'KDV Dahil Tutar'}</label>
             <div className="relative">
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={tutarStr} 
                  onChange={handleTutarChange} 
                  onBlur={handleTutarBlur}
                  className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-emerald-500 transition-colors">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">KDV Oranı</label>
             <div className="flex flex-wrap gap-3">
               {[1, 10, 20].map(rate => (
                 <button 
                   key={rate}
                   onClick={() => setPresetRate(rate)}
                   className={`px-6 py-3 rounded-xl font-bold transition-all ${oran === rate ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                 >
                   %{rate}
                 </button>
               ))}
               <button 
                 onClick={() => { if(!isCustomRate) { setPresetRate(15); setOranStr(''); } }}
                 className={`px-6 py-3 rounded-xl font-bold transition-all ${isCustomRate ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
               >
                 Özel Oran
               </button>
             </div>
             
             {isCustomRate && (
               <div className="mt-4 pt-4 border-t border-slate-100 relative max-w-xs">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={oranStr} 
                   onChange={handleOranChange} 
                   className="w-full text-2xl font-black text-slate-900 bg-transparent outline-none pb-1" 
                   placeholder="Örn: 15"
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">%</span>
               </div>
             )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="relative p-8 md:p-10 bg-emerald-600 rounded-3xl text-white overflow-hidden flex flex-col shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">KDV Hariç Tutar</span>
                <span className={`font-black ${mod === 'cikar' ? 'text-4xl md:text-5xl text-white drop-shadow-md' : 'text-3xl text-emerald-100'}`}>
                  {mounted ? <NumberFlow value={kdvHaric} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> : '0,00'} TL
                </span>
             </div>
             <div className="flex flex-col border-y md:border-y-0 md:border-x border-emerald-500/50 py-4 md:py-0 md:px-8">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">KDV Tutarı (%{oran})</span>
                <span className="text-3xl font-black text-emerald-100">
                  {mounted ? <NumberFlow value={kdvTutari} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> : '0,00'} TL
                </span>
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">KDV Dahil Tutar</span>
                <span className={`font-black ${mod === 'ekle' ? 'text-4xl md:text-5xl text-white drop-shadow-md' : 'text-3xl text-emerald-100'}`}>
                  {mounted ? <NumberFlow value={kdvDahil} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> : '0,00'} TL
                </span>
             </div>
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

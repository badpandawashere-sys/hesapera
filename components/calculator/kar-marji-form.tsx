'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { PieChart, Target, PlusCircle } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function KarMarjiForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [mod, setMod] = useState<'kar-zarar' | 'hedef-marj' | 'kar-orani'>('kar-zarar');
  
  const [maliyet, setMaliyet] = useState<number>(100);
  const [maliyetStr, setMaliyetStr] = useState<string>('100,00');

  const [satisFiyati, setSatisFiyati] = useState<number>(125);
  const [satisFiyatiStr, setSatisFiyatiStr] = useState<string>('125,00');
  
  const [hedefMarj, setHedefMarj] = useState<number>(20);
  const [hedefMarjStr, setHedefMarjStr] = useState<string>('20');
  
  const [karOrani, setKarOrani] = useState<number>(20);
  const [karOraniStr, setKarOraniStr] = useState<string>('20');
  
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    handleCalc(); 
  }, [maliyet, satisFiyati, hedefMarj, karOrani, mod]); // eslint-disable-line

  const handleCalc = async () => {
    if (maliyet < 0) return;
    if (mod === 'kar-zarar' && satisFiyati < 0) return;
    if (mod === 'hedef-marj' && (hedefMarj < 0 || hedefMarj >= 100)) return;
    if (mod === 'kar-orani' && karOrani < 0) return;
    
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, { 
        mod, 
        maliyet, 
        satisFiyati, 
        hedefMarj,
        karOrani
      });
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

  const primary = res?.data?.primaryResult || 0;
  const targetMarjError = mod === 'hedef-marj' && hedefMarj >= 100;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-slate-50 rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col gap-10">
        
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><PieChart className="w-6 h-6"/></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">KÂR MARJI HESAPLAMA</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Kâr / Zarar durumunuzu analiz edin veya hedef fiyat belirleyin.</p>
        </div>

        <div className="flex flex-col sm:flex-row bg-slate-200 p-1 rounded-2xl relative w-full lg:w-3/4 mx-auto gap-1">
          <div 
            className={`hidden sm:block absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-white rounded-xl shadow transition-all duration-300 ease-out z-0 
            ${mod === 'hedef-marj' ? 'translate-x-[calc(100%+4px)]' : mod === 'kar-orani' ? 'translate-x-[calc(200%+8px)]' : ''}`}
          ></div>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'kar-zarar' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('kar-zarar')}
          >
            <TrendingUpIcon mod={mod} /> Kâr / Zarar
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'hedef-marj' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('hedef-marj')}
          >
            <Target className="w-4 h-4" /> Hedef Marj
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'kar-orani' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('kar-orani')}
          >
            <PlusCircle className="w-4 h-4" /> Kâr Oranı
          </button>
        </div>

        <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-xs font-medium text-center shadow-sm">
          💡 <strong>Hatırlatma:</strong> Kâr Marjı <u>satış fiyatı</u> üzerinden, Kâr Oranı <u>maliyet</u> üzerinden hesaplanır.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative md:col-span-2">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Maliyet (Alış Fiyatı)</label>
             <div className="relative">
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={maliyetStr} 
                  onChange={makeNumberHandler(setMaliyetStr, setMaliyet)} 
                  onBlur={handleBlur(maliyet, setMaliyetStr)}
                  className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
             </div>
          </div>
          
          {mod === 'kar-zarar' && (
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative md:col-span-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Satış Fiyatı</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={satisFiyatiStr} 
                   onChange={makeNumberHandler(setSatisFiyatiStr, setSatisFiyati)} 
                   onBlur={handleBlur(satisFiyati, setSatisFiyatiStr)}
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
               </div>
            </div>
          )}

          {mod === 'hedef-marj' && (
            <div className={`bg-white p-6 rounded-2xl border-2 transition-colors relative md:col-span-2 ${targetMarjError ? 'border-red-500' : 'border-slate-200 focus-within:border-indigo-500'}`}>
               <label className={`text-xs font-bold uppercase tracking-widest block mb-2 ${targetMarjError ? 'text-red-500' : 'text-slate-400'}`}>Hedef Kâr Marjı (Satış Üzerinden)</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={hedefMarjStr} 
                   onChange={makeNumberHandler(setHedefMarjStr, setHedefMarj)} 
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">%</span>
               </div>
               {targetMarjError && <p className="text-red-500 text-xs mt-2 font-bold">Kâr marjı %100 veya daha büyük olamaz.</p>}
            </div>
          )}

          {mod === 'kar-orani' && (
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors relative md:col-span-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Hedef Kâr Oranı (Maliyet Üzerinden)</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={karOraniStr} 
                   onChange={makeNumberHandler(setKarOraniStr, setKarOrani)} 
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">%</span>
               </div>
            </div>
          )}

        </div>

        <div className={`relative p-8 md:p-10 rounded-3xl text-white overflow-hidden flex flex-col shadow-lg ${mod === 'kar-zarar' && primary < 0 ? 'bg-rose-600' : 'bg-indigo-600'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${mod === 'kar-zarar' && primary < 0 ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
          
          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
             <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${mod === 'kar-zarar' && primary < 0 ? 'text-rose-200' : 'text-indigo-200'}`}>
                  {mod === 'kar-zarar' ? (primary < 0 ? 'Zarar Tutarı' : 'Kâr Tutarı') : 'Önerilen Satış Fiyatı'}
                </span>
                <span className="font-black text-4xl md:text-5xl text-white drop-shadow-md">
                  {mounted && !targetMarjError ? (
                    <><NumberFlow value={Math.abs(primary)} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> TL</>
                  ) : ('0,00 TL')}
                </span>
                {mod === 'kar-zarar' && mounted && (
                   <span className="mt-2 text-sm font-bold opacity-80 uppercase tracking-wider">Durum: {res?.data?.secondaryResults?.['Durum'] || 'Başabaş'}</span>
                )}
             </div>
             
             <div className={`flex flex-col border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 ${mod === 'kar-zarar' && primary < 0 ? 'border-rose-500/50' : 'border-indigo-500/50'}`}>
                <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${mod === 'kar-zarar' && primary < 0 ? 'text-rose-200' : 'text-indigo-200'}`}>
                  {mod === 'kar-zarar' ? 'Kâr/Zarar Marjı (Satıştan)' : 'Kâr Tutarı'}
                </span>
                <span className={`text-3xl font-black mb-4 ${mod === 'kar-zarar' && primary < 0 ? 'text-rose-100' : 'text-indigo-100'}`}>
                  {mounted && !targetMarjError ? (
                     mod === 'kar-zarar' ? (
                       res?.data?.secondaryResults?.['Kâr Marjı'] || '%0'
                     ) : (
                       <><NumberFlow value={res?.data?.secondaryResults?.['Kâr Tutarı'] || 0} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> TL</>
                     )
                  ) : (mod === 'kar-zarar' ? '%0' : '0,00 TL')}
                </span>
                
                <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${mod === 'kar-zarar' && primary < 0 ? 'text-rose-200' : 'text-indigo-200'}`}>
                  {mod === 'kar-zarar' ? 'Kâr/Zarar Oranı (Maliyetten)' : mod === 'hedef-marj' ? 'Hedef Marj' : 'Gerçek Kâr Marjı'}
                </span>
                <span className={`text-2xl font-black ${mod === 'kar-zarar' && primary < 0 ? 'text-rose-100' : 'text-indigo-100'}`}>
                  {mounted && !targetMarjError ? (
                    mod === 'kar-zarar' ? (
                      res?.data?.secondaryResults?.['Kâr Oranı'] || '%0'
                    ) : mod === 'hedef-marj' ? (
                      res?.data?.secondaryResults?.['Hedef Marj'] || '%0'
                    ) : (
                      res?.data?.secondaryResults?.['Gerçek Kâr Marjı'] || '%0'
                    )
                  ) : ('%0')}
                </span>
             </div>
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

function TrendingUpIcon({ mod }: { mod: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

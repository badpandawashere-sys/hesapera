'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Tag, Search, Layers } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function IndirimHesaplamaForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [mod, setMod] = useState<'yuzde' | 'oran-bul' | 'coklu'>('yuzde');
  
  const [normalFiyat, setNormalFiyat] = useState<number>(1000);
  const [normalFiyatStr, setNormalFiyatStr] = useState<string>('1.000,00');

  const [indirimOrani, setIndirimOrani] = useState<number>(20);
  const [indirimOraniStr, setIndirimOraniStr] = useState<string>('20');
  
  const [indirimliFiyat, setIndirimliFiyat] = useState<number>(800);
  const [indirimliFiyatStr, setIndirimliFiyatStr] = useState<string>('800,00');

  const [ikinciOran, setIkinciOran] = useState<number>(10);
  const [ikinciOranStr, setIkinciOranStr] = useState<string>('10');
  
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    handleCalc(); 
  }, [normalFiyat, indirimOrani, indirimliFiyat, ikinciOran, mod]); // eslint-disable-line

  const handleCalc = async () => {
    if (normalFiyat <= 0) return;
    if (mod === 'yuzde' && (indirimOrani < 0 || indirimOrani > 100)) return;
    if (mod === 'oran-bul' && (indirimliFiyat < 0 || indirimliFiyat > normalFiyat)) return;
    if (mod === 'coklu' && (indirimOrani < 0 || indirimOrani > 100 || ikinciOran < 0 || ikinciOran > 100)) return;
    
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, { 
        mod, 
        normalFiyat, 
        indirimOrani, 
        indirimliFiyat, 
        ikinciIndirimOrani: ikinciOran 
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

  // Generic handler for price fields
  const makeNumberHandler = (
    setStr: (s: string) => void, 
    setVal: (v: number) => void, 
    maxVal?: number
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && parsed >= 0) {
      if (maxVal !== undefined && parsed > maxVal) return;
      setVal(parsed);
    }
  };

  const handleBlur = (val: number, setStr: (s: string) => void) => () => {
    setStr(formatThousands(val));
  };

  const primary = res?.data?.primaryResult || 0;
  const indirimTutari = res?.data?.secondaryResults?.['İndirim Tutarı'] || 0;
  const efektifOran = res?.data?.secondaryResults?.['Efektif İndirim Oranı'] || '%0';
  const toplamTasarruf = res?.data?.secondaryResults?.['Toplam Tasarruf'] || 0;
  
  const hasError = mod === 'oran-bul' && indirimliFiyat > normalFiyat;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-slate-50 rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col gap-10">
        
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><Tag className="w-6 h-6"/></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">İNDİRİM HESAPLAMA</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">İndirimli fiyatı, tasarrufu veya gerçek indirim oranını bulun</p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row bg-slate-200 p-1 rounded-2xl relative w-full lg:w-3/4 mx-auto gap-1">
          <div 
            className={`hidden sm:block absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-white rounded-xl shadow transition-all duration-300 ease-out z-0 
            ${mod === 'oran-bul' ? 'translate-x-[calc(100%+4px)]' : mod === 'coklu' ? 'translate-x-[calc(200%+8px)]' : ''}`}
          ></div>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'yuzde' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('yuzde')}
          >
            <Tag className="w-4 h-4" /> İndirim Hesapla
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'oran-bul' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('oran-bul')}
          >
            <Search className="w-4 h-4" /> Oranı Bul
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'coklu' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('coklu')}
          >
            <Layers className="w-4 h-4" /> Çoklu İndirim
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-rose-500 transition-colors relative md:col-span-2">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Normal Fiyat</label>
             <div className="relative">
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={normalFiyatStr} 
                  onChange={makeNumberHandler(setNormalFiyatStr, setNormalFiyat)} 
                  onBlur={handleBlur(normalFiyat, setNormalFiyatStr)}
                  className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
             </div>
          </div>
          
          {mod === 'yuzde' && (
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-rose-500 transition-colors md:col-span-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">İndirim Oranı</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={indirimOraniStr} 
                   onChange={makeNumberHandler(setIndirimOraniStr, setIndirimOrani, 100)} 
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">%</span>
               </div>
            </div>
          )}

          {mod === 'oran-bul' && (
            <div className={`bg-white p-6 rounded-2xl border-2 transition-colors md:col-span-2 ${hasError ? 'border-red-500' : 'border-slate-200 focus-within:border-rose-500'}`}>
               <label className={`text-xs font-bold uppercase tracking-widest block mb-2 ${hasError ? 'text-red-500' : 'text-slate-400'}`}>İndirimli Fiyat</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={indirimliFiyatStr} 
                   onChange={makeNumberHandler(setIndirimliFiyatStr, setIndirimliFiyat)} 
                   onBlur={handleBlur(indirimliFiyat, setIndirimliFiyatStr)}
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
               </div>
               {hasError && <p className="text-red-500 text-xs mt-2 font-bold">İndirimli fiyat normal fiyattan büyük olamaz!</p>}
            </div>
          )}
          
          {mod === 'coklu' && (
            <>
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-rose-500 transition-colors">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">1. İndirim Oranı</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     inputMode="decimal" 
                     value={indirimOraniStr} 
                     onChange={makeNumberHandler(setIndirimOraniStr, setIndirimOrani, 100)} 
                     className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                   />
                   <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">%</span>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-rose-500 transition-colors">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">2. İndirim Oranı</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     inputMode="decimal" 
                     value={ikinciOranStr} 
                     onChange={makeNumberHandler(setIkinciOranStr, setIkinciOran, 100)} 
                     className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                   />
                   <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">%</span>
                 </div>
              </div>
            </>
          )}

        </div>

        {/* Results Panel */}
        <div className="relative p-8 md:p-10 bg-rose-600 rounded-3xl text-white overflow-hidden flex flex-col shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">
                  {mod === 'oran-bul' ? 'İndirim Oranı' : 'İndirimli Son Fiyat'}
                </span>
                <span className="font-black text-4xl md:text-5xl text-white drop-shadow-md">
                  {mounted && !hasError ? (
                    mod === 'oran-bul' ? (
                      <>%<NumberFlow value={primary} format={{minimumFractionDigits:0, maximumFractionDigits:2}} /></>
                    ) : (
                      <><NumberFlow value={primary} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> TL</>
                    )
                  ) : (mod === 'oran-bul' ? '%0' : '0,00 TL')}
                </span>
             </div>
             
             <div className="flex flex-col border-t md:border-t-0 md:border-l border-rose-500/50 pt-4 md:pt-0 md:pl-8">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">
                  {mod === 'coklu' ? 'Toplam Tasarruf' : 'Kazanılan İndirim'}
                </span>
                <span className="text-3xl font-black text-rose-100 mb-4">
                  {mounted && !hasError ? <NumberFlow value={mod === 'coklu' ? toplamTasarruf : indirimTutari} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> : '0,00'} TL
                </span>
                
                {mod === 'coklu' && (
                  <>
                    <span className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">
                      Efektif İndirim Oranı
                    </span>
                    <span className="text-2xl font-black text-rose-100">
                      {mounted && !hasError ? efektifOran : '%0'}
                    </span>
                  </>
                )}
             </div>
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

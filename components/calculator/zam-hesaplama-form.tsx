'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { TrendingUp, Percent, RotateCcw } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const formatThousands = (num: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function ZamHesaplamaForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [mod, setMod] = useState<'zam-ekle' | 'oran-bul' | 'eski-fiyat-bul'>('zam-ekle');
  
  const [eskiFiyat, setEskiFiyat] = useState<number>(1000);
  const [eskiFiyatStr, setEskiFiyatStr] = useState<string>('1.000,00');

  const [zamOrani, setZamOrani] = useState<number>(20);
  const [zamOraniStr, setZamOraniStr] = useState<string>('20');
  
  const [yeniFiyat, setYeniFiyat] = useState<number>(1250);
  const [yeniFiyatStr, setYeniFiyatStr] = useState<string>('1.250,00');
  
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    handleCalc(); 
  }, [eskiFiyat, zamOrani, yeniFiyat, mod]); // eslint-disable-line

  const handleCalc = async () => {
    if (mod === 'zam-ekle' && (eskiFiyat < 0 || zamOrani < 0)) return;
    if (mod === 'oran-bul' && (eskiFiyat < 0 || yeniFiyat < 0)) return;
    if (mod === 'eski-fiyat-bul' && (yeniFiyat < 0 || zamOrani < 0)) return;
    
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, { 
        mod, 
        eskiFiyat, 
        zamOrani, 
        yeniFiyat
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
    const val = e.target.value.replace(/[^0-9,]/g, '');
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
  
  const hasError = mod === 'oran-bul' && yeniFiyat < eskiFiyat;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-slate-50 rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col gap-10">
        
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6"/></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">ZAM HESAPLAMA</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Zamlı fiyatı, artış tutarını veya eski fiyatı kolayca hesaplayın</p>
        </div>

        <div className="flex flex-col sm:flex-row bg-slate-200 p-1 rounded-2xl relative w-full lg:w-3/4 mx-auto gap-1">
          <div 
            className={`hidden sm:block absolute top-1 bottom-1 w-[calc(33.333%-4px)] bg-white rounded-xl shadow transition-all duration-300 ease-out z-0 
            ${mod === 'oran-bul' ? 'translate-x-[calc(100%+4px)]' : mod === 'eski-fiyat-bul' ? 'translate-x-[calc(200%+8px)]' : ''}`}
          ></div>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'zam-ekle' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('zam-ekle')}
          >
            <TrendingUp className="w-4 h-4" /> Zam Hesapla
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'oran-bul' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('oran-bul')}
          >
            <Percent className="w-4 h-4" /> Oranı Bul
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm sm:relative z-10 transition-colors ${mod === 'eski-fiyat-bul' ? 'bg-white sm:bg-transparent text-slate-800 shadow sm:shadow-none' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setMod('eski-fiyat-bul')}
          >
            <RotateCcw className="w-4 h-4" /> Eski Fiyatı Bul
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {(mod === 'zam-ekle' || mod === 'oran-bul') && (
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-emerald-500 transition-colors relative md:col-span-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Eski Fiyat</label>
               <div className="relative">
                  <input 
                    type="text" 
                    inputMode="decimal" 
                    value={eskiFiyatStr} 
                    onChange={makeNumberHandler(setEskiFiyatStr, setEskiFiyat)} 
                    onBlur={handleBlur(eskiFiyat, setEskiFiyatStr)}
                    className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                  />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
               </div>
            </div>
          )}
          
          {(mod === 'zam-ekle' || mod === 'eski-fiyat-bul') && (
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-emerald-500 transition-colors relative md:col-span-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Zam Oranı</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={zamOraniStr} 
                   onChange={makeNumberHandler(setZamOraniStr, setZamOrani)} 
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">%</span>
               </div>
            </div>
          )}

          {(mod === 'oran-bul' || mod === 'eski-fiyat-bul') && (
            <div className={`bg-white p-6 rounded-2xl border-2 transition-colors relative md:col-span-2 ${hasError ? 'border-red-500' : 'border-slate-200 focus-within:border-emerald-500'}`}>
               <label className={`text-xs font-bold uppercase tracking-widest block mb-2 ${hasError ? 'text-red-500' : 'text-slate-400'}`}>Yeni (Zamlı) Fiyat</label>
               <div className="relative">
                 <input 
                   type="text" 
                   inputMode="decimal" 
                   value={yeniFiyatStr} 
                   onChange={makeNumberHandler(setYeniFiyatStr, setYeniFiyat)} 
                   onBlur={handleBlur(yeniFiyat, setYeniFiyatStr)}
                   className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none pr-12" 
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl pointer-events-none">TL</span>
               </div>
               {hasError && <p className="text-red-500 text-xs mt-2 font-bold">Yeni fiyat eski fiyattan küçük olamaz (Bu bir indirimdir).</p>}
            </div>
          )}

        </div>

        <div className="relative p-8 md:p-10 bg-emerald-600 rounded-3xl text-white overflow-hidden flex flex-col shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">
                  {mod === 'zam-ekle' ? 'Zamlı Yeni Fiyat' : mod === 'oran-bul' ? 'Zam Oranı' : 'Zam Öncesi Eski Fiyat'}
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
             
             <div className="flex flex-col border-t md:border-t-0 md:border-l border-emerald-500/50 pt-4 md:pt-0 md:pl-8">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">
                  {mod === 'oran-bul' ? 'Artış Tutarı' : 'Zam Tutarı'}
                </span>
                <span className="text-3xl font-black text-emerald-100 mb-4">
                  {mounted && !hasError ? <NumberFlow value={res?.data?.secondaryResults?.['Zam Tutarı'] || res?.data?.secondaryResults?.['Artış Tutarı'] || 0} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> : '0,00'} TL
                </span>
                
                {mod !== 'oran-bul' && (
                  <>
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">
                      {mod === 'zam-ekle' ? 'Uygulanan Zam Oranı' : 'Zamlı Son Fiyat'}
                    </span>
                    <span className="text-2xl font-black text-emerald-100">
                      {mounted && !hasError ? (
                        mod === 'zam-ekle' ? (
                          res?.data?.secondaryResults?.['Zam Oranı'] || '%0'
                        ) : (
                          <><NumberFlow value={res?.data?.secondaryResults?.['Yeni Fiyat'] || 0} format={{minimumFractionDigits:2, maximumFractionDigits:2}} /> TL</>
                        )
                      ) : (mod === 'zam-ekle' ? '%0' : '0,00 TL')}
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

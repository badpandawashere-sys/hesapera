
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, History, Banknote, CalendarDays } from 'lucide-react';

export function HistoricalCurrencyForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ amount: 1000, currency: 'USD', rateType: 'forexBuying', date: '2023-01-15' });
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [inputs]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const update = (k: keyof typeof inputs, val: any) => {
    if(k === 'amount') setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
    else setInputs(p => ({ ...p, [k]: val }));
  };

  const isErr = res?.success === false;
  const primary = res?.data?.primaryResult || '0 ₺';
  const sr = res?.data?.secondaryResults || {};

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-[#f0f4f8] border border-blue-200/50 rounded-3xl p-6 lg:p-10 flex flex-col lg:flex-row gap-10 shadow-sm">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-blue-100 pb-4">
             <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><History className="w-6 h-6"/></div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Geçmiş Kur Gezginı</h2>
               <p className="text-xs font-bold text-blue-600/70 uppercase tracking-widest mt-1">Zaman Çizelgesi</p>
             </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-500"/> Geçmiş Tarih</label>
               <input type="date" value={inputs.date} onChange={e=>update('date', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-blue-100 font-bold outline-none focus:border-blue-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Para Birimi</label>
                 <select value={inputs.currency} onChange={e=>update('currency', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-blue-100 font-bold outline-none focus:border-blue-400">
                   <option value="USD">Dolar (USD)</option>
                   <option value="EUR">Euro (EUR)</option>
                   <option value="GBP">Sterlin (GBP)</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kur Tipi</label>
                 <select value={inputs.rateType} onChange={e=>update('rateType', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-blue-100 font-bold outline-none focus:border-blue-400">
                   <option value="forexBuying">Döviz Alış</option>
                   <option value="forexSelling">Döviz Satış</option>
                   <option value="banknoteBuying">Efektif Alış</option>
                   <option value="banknoteSelling">Efektif Satış</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2 pt-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Banknote className="w-4 h-4 text-blue-500"/> Döviz Tutarı</label>
               <input type="number" step="0.01" value={inputs.amount||''} onChange={e=>update('amount', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-blue-100 font-black text-xl text-slate-800 outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          {isErr ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100 text-center">
               {res.errors?.[0] || 'Hata'}
            </div>
          ) : (
            <div className="bg-[#0f172a] rounded-[2rem] p-8 text-blue-50 shadow-2xl relative border-4 border-blue-500/20 overflow-hidden">
               
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

               <div className="relative z-10 text-center mt-2 border-b border-slate-700/50 pb-6 mb-6">
                 <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex justify-center items-center gap-2 mb-4">
                   Tarihsel Kur Karşılığı {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                 </h3>
                 <div className="text-5xl md:text-6xl font-black text-white drop-shadow-md tracking-tighter">
                   {mounted ? primary : '0 ₺'}
                 </div>
                 <div className="text-sm font-bold text-blue-200/50 mt-2">Türk Lirası</div>
               </div>

               <div className="relative z-10 space-y-4 font-mono text-sm">
                 <div className="flex justify-between">
                   <span className="text-slate-400">Referans Tarihi</span>
                   <span className="font-bold text-blue-200">{sr['Tarih'] || '-'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-400">Kur Tipi</span>
                   <span className="font-bold text-blue-200">{sr['Kur Tipi'] || '-'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-400">Yabancı Tutar</span>
                   <span className="font-bold text-blue-200">{sr['Tutar'] || '-'}</span>
                 </div>
                 <div className="flex justify-between border-t border-slate-700/50 pt-4 mt-2">
                   <span className="text-blue-400 font-bold">Kullanılan Kur</span>
                   <span className="font-bold text-white text-lg">{sr['Kullanılan Kur'] || '-'}</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

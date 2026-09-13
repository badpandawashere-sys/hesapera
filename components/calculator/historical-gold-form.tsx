'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, History, CalendarDays, Coins } from 'lucide-react';

export function HistoricalGoldForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ transactionType: 'to_cash', instrumentId: 'gram', date: '2023-01-15', quantity: 100, cashAmount: 0 });
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
    if(k === 'transactionType' || k === 'instrumentId' || k === 'date') setInputs(p => ({ ...p, [k]: val }));
    else setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const isErr = res?.success === false;
  const primary = res?.data?.primaryResult || '0';
  const primaryLabel = res?.data?.primaryLabel || 'Değer';
  const sr = res?.data?.secondaryResults || {};
  const breakdown = res?.data?.breakdown || [];

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-[#fdfbf7] border border-amber-200/50 rounded-3xl p-6 lg:p-10 flex flex-col lg:flex-row gap-10 shadow-sm">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-amber-100 pb-4">
             <div className="p-3 bg-amber-100 text-amber-700 rounded-xl"><History className="w-6 h-6"/></div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Geçmiş Altın Hesaplama</h2>
               <p className="text-xs font-bold text-amber-600/70 uppercase tracking-widest mt-1">Tarihsel Değer / Miktar Çevirici</p>
             </div>
          </div>
          
          <div className="space-y-5">
            <div className="flex gap-2 p-1 bg-white border border-amber-100 rounded-lg">
              <button onClick={()=>update('transactionType', 'to_cash')} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-md transition-all ${inputs.transactionType==='to_cash'?'bg-amber-100 text-amber-800':'text-slate-500'}`}>Altından Paraya</button>
              <button onClick={()=>update('transactionType', 'to_gold')} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-md transition-all ${inputs.transactionType==='to_gold'?'bg-amber-100 text-amber-800':'text-slate-500'}`}>Paradan Altına</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2 space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <CalendarDays className="w-4 h-4 text-amber-500"/> Tarih
                 </label>
                 <input type="date" min="2016-01-01" value={inputs.date} onChange={e=>update('date', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-amber-100 font-bold outline-none focus:border-amber-400" />
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Altın Türü</label>
                 <select value={inputs.instrumentId} onChange={e=>update('instrumentId', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-amber-100 font-bold outline-none">
                   <option value="gram">Gram Altın</option>
                 </select>
               </div>
               
               {inputs.transactionType === 'to_cash' ? (
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Miktar (Gram/Adet)</label>
                   <input type="number" step="1" min="0" value={inputs.quantity||''} onChange={e=>update('quantity', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-amber-100 font-bold outline-none focus:border-amber-400" />
                 </div>
               ) : (
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Para (TL)</label>
                   <input type="number" step="1000" min="0" value={inputs.cashAmount||''} onChange={e=>update('cashAmount', e.target.value)} className="w-full p-4 rounded-xl bg-white border border-amber-100 font-bold outline-none focus:border-amber-400" />
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          {isErr ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100 text-center">
               {res.errors?.[0] || 'Hata'}
            </div>
          ) : (
            <div className="bg-[#1e1e1e] rounded-[2rem] p-6 lg:p-8 text-amber-50 shadow-2xl relative border-4 border-amber-500/20">
               <div className="absolute top-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHBvbHlnb24gcG9pbnRzPScwLDEwIDUsMCAxMCwxMCcgZmlsbD0nI2ZkZmJmNycgLz4KPC9zdmc+')] bg-repeat-x rotate-180 transform -translate-y-[2px]"></div>
               
               <div className="text-center mt-2 border-b border-white/10 pb-6 mb-6">
                 <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex justify-center items-center gap-2 mb-4">
                   Hesaplama Sonucu {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                 </h3>
                 <div className="text-4xl md:text-5xl font-black text-white drop-shadow-md tracking-tighter">
                   {mounted ? primary : '0'}
                 </div>
                 <div className="text-sm font-bold text-amber-200/50 mt-2">{primaryLabel}</div>
               </div>

               <div className="space-y-3 font-mono text-xs">
                 <div className="flex justify-between p-2 rounded-lg bg-white/5">
                   <span className="text-slate-400">Kullanılan Tarih</span>
                   <span className="font-bold text-amber-100 text-right max-w-[65%] leading-tight">{sr['Kullanılan Tarih'] || '-'}</span>
                 </div>
                 
                 <div className="flex justify-between p-2">
                   <span className="text-slate-400">Alış Fiyatı</span>
                   <span className="font-bold text-white">{sr['Alış Fiyatı'] || '-'}</span>
                 </div>
                 <div className="flex justify-between p-2">
                   <span className="text-slate-400">Satış Fiyatı</span>
                   <span className="font-bold text-white">{sr['Satış Fiyatı'] || '-'}</span>
                 </div>
                 
                 <div className="border-t border-white/10 pt-4 mt-2">
                   {inputs.transactionType === 'to_cash' ? (
                     <>
                       <div className="flex justify-between p-2">
                         <span className="text-slate-400">Alışa Göre Değer</span>
                         <span className="font-bold text-amber-400">{sr['Alışa Göre Değer'] || '-'}</span>
                       </div>
                       <div className="flex justify-between p-2">
                         <span className="text-slate-400">Satışa Göre Değer</span>
                         <span className="font-bold text-amber-400">{sr['Satışa Göre Değer'] || '-'}</span>
                       </div>
                     </>
                   ) : (
                     <>
                       <div className="flex justify-between p-2">
                         <span className="text-slate-400">Alışa Göre Miktar</span>
                         <span className="font-bold text-amber-400">{sr['Alışa Göre Miktar'] || '-'}</span>
                       </div>
                       <div className="flex justify-between p-2">
                         <span className="text-slate-400">Satışa Göre Miktar</span>
                         <span className="font-bold text-amber-400">{sr['Satışa Göre Miktar'] || '-'}</span>
                       </div>
                     </>
                   )}
                 </div>

                 {/* Arşiv Verileri Expandable/Mini */}
                 <div className="mt-6 pt-4 border-t border-white/5">
                   <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><History className="w-3 h-3"/> Tarihsel Arşiv Verileri</div>
                   <div className="grid grid-cols-2 gap-2 text-[10px]">
                     {breakdown.map((item: any, i: number) => (
                       <div key={i} className="flex justify-between p-1.5 bg-black/20 rounded">
                         <span className="text-white/40">{item.label}</span>
                         <span className="text-white/70 font-bold">{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 {res?.notes?.length > 0 && (
                   <div className="text-[9px] text-white/30 mt-4 text-center flex flex-col gap-1">
                     {res.notes.map((n:string,i:number)=><span key={i}>{n}</span>)}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

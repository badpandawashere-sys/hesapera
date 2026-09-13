
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Divide, Scale } from 'lucide-react';

export function OranForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ a: 120, b: 80 });
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [inputs]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      if (resp.success) setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const primary = res?.data?.primaryResult || '1:1';
  const sr = res?.data?.secondaryResults || {};

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 flex flex-col items-center">
        
        <div className="mb-10 text-center">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4"><Scale className="w-6 h-6"/></div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Oran Sadeleştirme</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">A / B değerlerinin en sade halini keşfedin</p>
        </div>

        <div className="flex items-center gap-6 w-full max-w-2xl">
          <div className="flex-1 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 focus-within:border-rose-400 transition-colors">
            <label className="block text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">A Değeri</label>
            <input type="number" value={inputs.a||''} onChange={e=>setInputs(p=>({...p, a: parseInt(e.target.value)}))} className="w-full text-center text-4xl font-black text-slate-800 bg-transparent outline-none" />
          </div>
          <div className="w-12 flex justify-center text-slate-300">
             <Divide className="w-8 h-8" />
          </div>
          <div className="flex-1 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 focus-within:border-rose-400 transition-colors">
            <label className="block text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">B Değeri</label>
            <input type="number" value={inputs.b||''} onChange={e=>setInputs(p=>({...p, b: parseInt(e.target.value)}))} className="w-full text-center text-4xl font-black text-slate-800 bg-transparent outline-none" />
          </div>
        </div>

        <div className="mt-12 w-full max-w-md bg-rose-500 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-rose-200 text-center">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          
          <p className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
            En Sade Hal {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
          </p>
          <div className="text-7xl font-black tracking-tighter drop-shadow-sm relative z-10">
            {mounted ? primary : '0:0'}
          </div>
          
          <div className="mt-6 flex justify-center gap-4 relative z-10">
            <div className="bg-rose-900/30 px-4 py-2 rounded-xl text-xs font-bold text-rose-100">
              Ondalık: {sr['Ondalık Değer (A/B)'] || '0'}
            </div>
            <div className="bg-rose-900/30 px-4 py-2 rounded-xl text-xs font-bold text-rose-100">
              EBOB: {sr['Ortak Bölen (EBOB)'] || '0'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

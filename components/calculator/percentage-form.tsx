
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Percent, ArrowRight } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function PercentageForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ baseValue: 1000, percentage: 20 });
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

  const pVal = res?.data?.primaryResult || 0;
  const perc = Math.min(100, Math.max(0, inputs.percentage || 0));

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-slate-50 rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col gap-10">
        
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Percent className="w-6 h-6"/></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Yüzde İlişkisi</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Bir sayının belirli bir yüzdelik dilimini bulun</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Ana Sayı (Değer)</label>
             <NumericInput   value={inputs.baseValue||''} onChange={e=>setInputs(p=>({...p, baseValue: parseFloat(e.target.value)}))} className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none" />
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 focus-within:border-indigo-500 transition-colors">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Yüzde Oranı (%)</label>
             <NumericInput   value={inputs.percentage||''} onChange={e=>setInputs(p=>({...p, percentage: parseFloat(e.target.value)}))} className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none" />
          </div>
        </div>

        <div className="relative p-10 bg-indigo-600 rounded-3xl text-white overflow-hidden flex flex-col items-center shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 w-full">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">Hesaplanan Sonuç {loading && <Loader2 className="w-3 h-3 animate-spin"/>}</span>
                <span className="text-xs font-bold text-indigo-300">%{inputs.percentage} Pay</span>
             </div>
             
             <div className="text-6xl md:text-7xl font-black tracking-tighter drop-shadow-md flex items-center gap-4">
               {mounted ? <NumberFlow value={pVal} format={{maximumFractionDigits:2}} /> : '0'}
             </div>

             <div className="mt-10 w-full h-4 bg-indigo-950/50 rounded-full overflow-hidden">
               <div style={{width: `${perc}%`}} className="h-full bg-white transition-all duration-700 ease-out"></div>
             </div>
             <div className="flex justify-between mt-2 text-xs font-bold text-indigo-300">
               <span>0</span>
               <span>{inputs.baseValue} (%100)</span>
             </div>
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

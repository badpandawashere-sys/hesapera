
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Calculator } from 'lucide-react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function FactorialForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ n: 5 });
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

  const primary = res?.data?.primaryResult || '1';
  let islem = '';
  if(res?.data?.breakdown) {
    const islemObj = res.data.breakdown.find((b:any)=>b.label==='İşlem');
    if(islemObj) islem = islemObj.value;
  }

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl p-6 lg:p-12 text-slate-300 flex flex-col gap-10">
        
        <div className="flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center mb-4 border border-sky-500/30">
             <Calculator className="w-6 h-6"/>
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-widest font-mono">n! Faktöriyel</h2>
           <p className="text-sm font-medium text-slate-500 mt-2">Matematiksel büyümenin gücü</p>
        </div>

        <div className="flex flex-col items-center">
          <label className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-4">n Değeri Girin</label>
          <div className="flex items-center gap-4">
             <NumericInput   min="0" max="2000" value={inputs.n||''} onChange={e=>setInputs({n: parseInt(e.target.value)})} className="w-32 bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-center text-4xl font-black text-white outline-none focus:border-sky-500 transition-colors" />
             <span className="text-4xl font-black text-slate-600">!</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Sonuç {loading && <Loader2 className="w-3 h-3 animate-spin"/>}</div>
          </div>
          
          <div className="w-full max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 text-left">
            <div className="text-3xl md:text-4xl font-black text-white font-mono break-all leading-tight">
              {mounted ? primary : '1'}
            </div>
          </div>
          
          {islem && (
            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-2">Hesaplama Adımı</div>
               <div className="text-sm font-mono text-slate-400 break-all">{islem}</div>
            </div>
          )}
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

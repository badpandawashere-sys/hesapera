
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Target } from 'lucide-react';
import NumberFlow from '@number-flow/react';

export function IdealKiloForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ cinsiyet: 'Kadın', boy: 165 });
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

  const primaryStr = res?.data?.primaryResult || '0';
  const ideal = parseFloat(primaryStr.replace(/[^0-9.]/g, '')) || 0;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col items-center gap-8 text-center">
        
        <div>
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4"><Target className="w-6 h-6"/></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">İdeal Kilo Hedefi</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Devine Formülü ile yalnızca boyunuza dayalı standart hesaplama</p>
        </div>

        <div className="flex gap-4 p-1 bg-slate-100 rounded-full">
          <button onClick={()=>setInputs(p=>({...p, cinsiyet: 'Erkek'}))} className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${inputs.cinsiyet==='Erkek'?'bg-white shadow-sm text-blue-600':'text-slate-500'}`}>Erkek</button>
          <button onClick={()=>setInputs(p=>({...p, cinsiyet: 'Kadın'}))} className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${inputs.cinsiyet==='Kadın'?'bg-white shadow-sm text-blue-600':'text-slate-500'}`}>Kadın</button>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Boyunuz (cm)</label>
          <input type="range" min="130" max="230" step="1" value={inputs.boy} onChange={e=>setInputs(p=>({...p, boy: parseInt(e.target.value)}))} className="w-full accent-blue-500" />
          <div className="text-2xl font-black text-slate-800">{inputs.boy} cm</div>
        </div>

        <div className="mt-8 p-10 bg-blue-50 rounded-[2rem] border border-blue-100 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/50 rounded-full blur-2xl"></div>
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
            Hedef Kilo {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
          </h3>
          <div className="text-6xl font-black text-blue-600 tracking-tighter flex justify-center items-baseline gap-2 drop-shadow-sm">
            {mounted ? <NumberFlow value={ideal} format={{maximumFractionDigits:1}} /> : '0'} <span className="text-2xl font-bold text-blue-400/80">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

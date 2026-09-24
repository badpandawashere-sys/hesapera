
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Radical } from 'lucide-react';

export function KokluSayiForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ derece: 2, sayi: 144 });
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

  const isErr = res?.success === false;
  const primary = res?.data?.primaryResult || '0';
  const sr = res?.data?.secondaryResults || {};

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-black text-white rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="w-full md:w-1/2 space-y-6 z-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Köklü Sayı <Radical className="text-emerald-400 w-8 h-8"/>
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-2">Kare, küp ve N. dereceden kök</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
             <div className="w-16 space-y-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase">Derece(n)</label>
               <input type="text" inputMode="numeric" pattern="[0-9]*" min="2" value={inputs.derece} onChange={e=>setInputs(p=>({...p, derece: parseInt(e.target.value)||2}))} className="w-full p-2 text-center bg-slate-950 border-b-2 border-emerald-500 font-bold outline-none text-emerald-400 text-xl" />
             </div>
             <div className="text-4xl font-light text-slate-700">√</div>
             <div className="flex-1 space-y-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase">Sayı(x)</label>
               <input type="text" inputMode="numeric" pattern="[0-9]*" value={inputs.sayi||''} onChange={e=>setInputs(p=>({...p, sayi: parseFloat(e.target.value)||0}))} className="w-full p-4 text-center bg-slate-950 border-b-2 border-emerald-500 font-black outline-none text-white text-3xl" />
             </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 z-10 flex flex-col justify-center items-center">
           {isErr ? (
             <div className="bg-red-950/50 text-red-400 p-6 rounded-2xl font-bold border border-red-900/50 text-center w-full">{res.errors?.[0]}</div>
           ) : (
             <div className="w-full text-center">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                  Sonuç {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                </p>
                
                <div className="text-7xl md:text-8xl font-black text-white drop-shadow-xl tracking-tighter mb-8 break-all">
                  {mounted ? primary : '0'}
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Tam Kök mü?</div>
                    <div className="font-bold text-emerald-300 mt-1">{sr['Tam Kök mü?']}</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Gösterim</div>
                    <div className="font-bold text-emerald-300 mt-1 font-mono text-sm">{sr['Matematiksel Gösterim']}</div>
                  </div>
                </div>
             </div>
           )}
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

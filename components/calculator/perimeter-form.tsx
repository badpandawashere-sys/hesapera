
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Route } from 'lucide-react';

export function PerimeterForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ 
    sekil: 'Dikdörtgen', birim: 'cm', 
    kenarA: 10, kenarB: 20, kenarC: 0, kenarD: 0, yaricap: 0 
  });
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
    if(k === 'sekil' || k === 'birim') setInputs(p => ({ ...p, [k]: val }));
    else setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const isErr = res?.success === false;
  const primary = res?.data?.primaryResult || '0 cm';
  const sr = res?.data?.secondaryResults || {};

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row text-slate-300">
        
        <div className="w-full md:w-1/2 p-8 border-r border-slate-800">
          <div className="flex items-center gap-3 mb-8 text-white">
             <div className="bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-xl text-indigo-400"><Route className="w-6 h-6"/></div>
             <h2 className="text-3xl font-black">Çevre</h2>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase">Şekil</label>
                 <select value={inputs.sekil} onChange={e=>update('sekil', e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 font-bold outline-none text-white focus:border-indigo-500">
                   <option value="Kare">Kare</option>
                   <option value="Dikdörtgen">Dikdörtgen</option>
                   <option value="Üçgen">Üçgen</option>
                   <option value="Paralelkenar">Paralelkenar</option>
                   <option value="Yamuk">Yamuk</option>
                   <option value="Daire">Daire</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase">Birim</label>
                 <select value={inputs.birim} onChange={e=>update('birim', e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 font-bold outline-none text-white focus:border-indigo-500">
                   <option value="cm">Santimetre(cm)</option>
                   <option value="m">Metre(m)</option>
                   <option value="mm">Milimetre(mm)</option>
                 </select>
               </div>
             </div>

             <div className="space-y-3 mt-4">
                {(inputs.sekil!=='Daire') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400">1. Kenar / Alt Taban</label>
                    <input type="number" value={inputs.kenarA||''} onChange={e=>update('kenarA', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white focus:border-indigo-500" />
                  </div>
                )}
                {(['Dikdörtgen', 'Üçgen', 'Paralelkenar', 'Yamuk'].includes(inputs.sekil)) && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400">2. Kenar / Üst Taban</label>
                    <input type="number" value={inputs.kenarB||''} onChange={e=>update('kenarB', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white focus:border-indigo-500" />
                  </div>
                )}
                {(['Üçgen', 'Yamuk'].includes(inputs.sekil)) && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400">3. Kenar</label>
                    <input type="number" value={inputs.kenarC||''} onChange={e=>update('kenarC', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white focus:border-indigo-500" />
                  </div>
                )}
                {inputs.sekil==='Yamuk' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400">4. Kenar</label>
                    <input type="number" value={inputs.kenarD||''} onChange={e=>update('kenarD', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white focus:border-indigo-500" />
                  </div>
                )}
                {inputs.sekil==='Daire' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400">Yarıçap (r)</label>
                    <input type="number" value={inputs.yaricap||''} onChange={e=>update('yaricap', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none text-white focus:border-indigo-500" />
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center relative">
          
          {isErr ? (
            <div className="bg-red-900/20 text-red-400 p-6 rounded-2xl font-bold text-center border border-red-900/50">{res.errors?.[0]}</div>
          ) : (
            <div className="text-center">
               <div className="w-32 h-32 mx-auto mb-8 border-4 border-dashed border-indigo-500/50 rounded-full flex items-center justify-center">
                 <div className="text-3xl text-indigo-400"><Route/></div>
               </div>
               
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                 Dış Sınır Uzunluğu {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
               </p>
               <div className="text-5xl md:text-6xl font-black text-white drop-shadow-md tracking-tighter mb-6">
                 {mounted ? primary : '0'}
               </div>
               
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 inline-block font-mono text-sm">
                 <span className="text-slate-500">Formül:</span> <span className="text-indigo-300 font-bold ml-2">{sr['Kullanılan Formül']}</span>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

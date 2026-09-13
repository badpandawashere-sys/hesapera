
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Box } from 'lucide-react';

export function VolumeForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ sekil: 'Dikdörtgenler Prizması', birim: 'm', kenarA: 5, kenarB: 4, kenarC: 3, yaricap: 2, yukseklik: 5 });
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

  const update = (k: keyof typeof inputs, val: any) => {
    if(k === 'sekil' || k === 'birim') setInputs(p => ({ ...p, [k]: val }));
    else setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const primary = res?.data?.primaryResult || '0 m³';

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-violet-100 text-violet-600 rounded-xl"><Box className="w-6 h-6"/></div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hacim (m³)</h2>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">3D Geometri</p>
             </div>
          </div>
          
          <div className="space-y-4">
            <select value={inputs.sekil} onChange={e=>update('sekil', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 outline-none focus:border-violet-500">
              <option value="Küp">Küp</option>
              <option value="Dikdörtgenler Prizması">Dikdörtgenler Prizması</option>
              <option value="Küre">Küre</option>
              <option value="Silindir">Silindir</option>
              <option value="Koni">Koni</option>
            </select>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button onClick={()=>update('birim', 'm')} className={`flex-1 py-2 text-sm font-bold rounded-md ${inputs.birim==='m'?'bg-white shadow-sm text-violet-600':'text-slate-500'}`}>Metre (m)</button>
              <button onClick={()=>update('birim', 'cm')} className={`flex-1 py-2 text-sm font-bold rounded-md ${inputs.birim==='cm'?'bg-white shadow-sm text-violet-600':'text-slate-500'}`}>Santimetre (cm)</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(inputs.sekil === 'Küp' || inputs.sekil === 'Dikdörtgenler Prizması') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kenar A</label>
                  <input type="number" value={inputs.kenarA||''} onChange={e=>update('kenarA', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none" />
                </div>
              )}
              {inputs.sekil === 'Dikdörtgenler Prizması' && (
                <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kenar B</label>
                  <input type="number" value={inputs.kenarB||''} onChange={e=>update('kenarB', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kenar C</label>
                  <input type="number" value={inputs.kenarC||''} onChange={e=>update('kenarC', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none" />
                </div>
                </>
              )}
              {(inputs.sekil === 'Küre' || inputs.sekil === 'Silindir' || inputs.sekil === 'Koni') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Yarıçap</label>
                  <input type="number" value={inputs.yaricap||''} onChange={e=>update('yaricap', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none" />
                </div>
              )}
              {(inputs.sekil === 'Silindir' || inputs.sekil === 'Koni') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Yükseklik</label>
                  <input type="number" value={inputs.yukseklik||''} onChange={e=>update('yukseklik', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-slate-800 outline-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] bg-slate-900 rounded-3xl p-8 text-center flex flex-col justify-center items-center relative overflow-hidden">
           {/* Isometric Grid Background */}
           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(30deg, #fff 1px, transparent 1px), linear-gradient(150deg, #fff 1px, transparent 1px)', backgroundSize: '20px 35px'}}></div>

           <div className="relative z-10 w-full">
             <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-400/40 to-violet-900/40 rounded-xl border-2 border-violet-500/50 flex items-center justify-center transform rotate-12 rotate-y-12 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
               <Box className="w-10 h-10 text-violet-300 transform -rotate-12"/>
             </div>

             <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
               Toplam Hacim {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
             </h3>
             <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tighter break-words px-4">
               {mounted ? primary : '0 m³'}
             </div>
             {res?.data?.secondaryResults?.['İşlem'] && (
               <div className="mt-4 text-xs font-mono text-slate-400 bg-white/5 p-2 rounded-lg inline-block">
                 {res.data.secondaryResults['İşlem']}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

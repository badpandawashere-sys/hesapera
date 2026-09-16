
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Square, MoveHorizontal, MoveVertical } from 'lucide-react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function MetrekareForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ uzunluk: 5, genislik: 4, birim: 'm' });
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

  const primary = res?.data?.primaryResult || '0 m²';
  
  // Calculate visual aspect ratio (cap at 1:5 max distortion for safety)
  const l = Math.max(0.1, inputs.uzunluk || 1);
  const w = Math.max(0.1, inputs.genislik || 1);
  const maxDim = Math.max(l, w);
  const minDim = Math.min(l, w);
  const distortion = maxDim / minDim;
  const clampedDistortion = Math.min(distortion, 3);
  
  const widthPerc = l >= w ? 100 : (w / l) * 100 / clampedDistortion;
  const heightPerc = w >= l ? 100 : (l / w) * 100 / clampedDistortion;

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col lg:flex-row gap-12 items-center">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Square className="w-6 h-6"/></div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Alan (m²)</h2>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">2D Geometri</p>
             </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button onClick={()=>setInputs(p=>({...p, birim: 'm'}))} className={`flex-1 py-2 text-sm font-bold rounded-md ${inputs.birim==='m'?'bg-white shadow-sm text-teal-600':'text-slate-500'}`}>Metre (m)</button>
              <button onClick={()=>setInputs(p=>({...p, birim: 'cm'}))} className={`flex-1 py-2 text-sm font-bold rounded-md ${inputs.birim==='cm'?'bg-white shadow-sm text-teal-600':'text-slate-500'}`}>Santimetre (cm)</button>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-teal-400 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MoveHorizontal className="w-3 h-3"/> Uzunluk</label>
              <NumericInput   value={inputs.uzunluk||''} onChange={e=>setInputs(p=>({...p, uzunluk: parseFloat(e.target.value)}))} className="w-full text-2xl font-black text-slate-800 bg-transparent outline-none" />
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-teal-400 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MoveVertical className="w-3 h-3"/> Genişlik</label>
              <NumericInput   value={inputs.genislik||''} onChange={e=>setInputs(p=>({...p, genislik: parseFloat(e.target.value)}))} className="w-full text-2xl font-black text-slate-800 bg-transparent outline-none" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex flex-col items-center justify-center min-h-[350px] relative bg-slate-900 rounded-3xl p-8 overflow-hidden">
           {/* Blueprint Grid Background */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_9px,rgba(255,255,255,0.05)_10px),linear-gradient(90deg,transparent_9px,rgba(255,255,255,0.05)_10px)] bg-[length:20px_20px]"></div>
           
           <div className="relative z-10 flex flex-col items-center gap-6">
             {/* The Area Box */}
             <div className="border-2 border-teal-400 bg-teal-500/20 shadow-[0_0_30px_rgba(45,212,191,0.2)] flex items-center justify-center transition-all duration-700 ease-in-out relative" style={{width: `${Math.min(250, widthPerc * 2.5)}px`, height: `${Math.min(250, heightPerc * 2.5)}px`}}>
               <span className="text-teal-300 font-bold text-xs absolute -top-5"><MoveHorizontal className="w-3 h-3 inline"/> {inputs.uzunluk} {inputs.birim}</span>
               <span className="text-teal-300 font-bold text-xs absolute -right-16 rotate-90 origin-left"><MoveVertical className="w-3 h-3 inline"/> {inputs.genislik} {inputs.birim}</span>
             </div>

             <div className="text-center mt-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[200px]">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-center items-center gap-2 mb-1">
                 Toplam Alan {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
               </h3>
               <div className="text-3xl font-black text-white">{mounted ? primary : '0 m²'}</div>
             </div>
           </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

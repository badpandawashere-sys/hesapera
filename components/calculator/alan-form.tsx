
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Square, RectangleHorizontal, Triangle, Circle, Hexagon, Maximize } from 'lucide-react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function AlanForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ 
    sekil: 'Dikdörtgen', birim: 'cm', 
    kenarA: 10, kenarB: 20, taban: 0, ustTaban: 0, yukseklik: 0, yaricap: 0, buyukYaricap: 0, kucukYaricap: 0 
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
  const primary = res?.data?.primaryResult || '0 cm²';
  const sr = res?.data?.secondaryResults || {};

  const getIcon = (s: string) => {
    if(s==='Kare') return <Square className="w-20 h-20 text-rose-300"/>;
    if(s==='Dikdörtgen') return <RectangleHorizontal className="w-20 h-20 text-rose-300"/>;
    if(s==='Üçgen') return <Triangle className="w-20 h-20 text-rose-300"/>;
    if(s==='Daire' || s==='Elips') return <Circle className="w-20 h-20 text-rose-300"/>;
    return <Hexagon className="w-20 h-20 text-rose-300"/>;
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-white border border-rose-100 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row overflow-hidden">
        
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-rose-50/50">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-rose-200 p-3 rounded-2xl text-rose-700"><Maximize className="w-6 h-6"/></div>
             <h2 className="text-3xl font-black text-rose-950">Alan</h2>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Şekil</label>
                 <select value={inputs.sekil} onChange={e=>update('sekil', e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-rose-200 font-bold outline-none focus:border-rose-400">
                   <option value="Kare">Kare</option>
                   <option value="Dikdörtgen">Dikdörtgen</option>
                   <option value="Üçgen">Üçgen</option>
                   <option value="Paralelkenar">Paralelkenar</option>
                   <option value="Yamuk">Yamuk</option>
                   <option value="Daire">Daire</option>
                   <option value="Elips">Elips</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Birim</label>
                 <select value={inputs.birim} onChange={e=>update('birim', e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-rose-200 font-bold outline-none focus:border-rose-400">
                   <option value="cm">Santimetre(cm)</option>
                   <option value="m">Metre(m)</option>
                   <option value="mm">Milimetre(mm)</option>
                 </select>
               </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-rose-100 space-y-4 mt-6">
                {(inputs.sekil==='Kare' || inputs.sekil==='Dikdörtgen') && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Kenar A (Kısa/Tüm)</label>
                    <NumericInput   value={inputs.kenarA||''} onChange={e=>update('kenarA', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                )}
                {inputs.sekil==='Dikdörtgen' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Kenar B (Uzun)</label>
                    <NumericInput   value={inputs.kenarB||''} onChange={e=>update('kenarB', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                )}
                {(inputs.sekil==='Üçgen' || inputs.sekil==='Paralelkenar' || inputs.sekil==='Yamuk') && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Taban</label>
                      <NumericInput   value={inputs.taban||''} onChange={e=>update('taban', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Yükseklik</label>
                      <NumericInput   value={inputs.yukseklik||''} onChange={e=>update('yukseklik', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </>
                )}
                {inputs.sekil==='Yamuk' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Üst Taban</label>
                    <NumericInput   value={inputs.ustTaban||''} onChange={e=>update('ustTaban', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                )}
                {inputs.sekil==='Daire' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Yarıçap (r)</label>
                    <NumericInput   value={inputs.yaricap||''} onChange={e=>update('yaricap', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                )}
                {inputs.sekil==='Elips' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Büyük Yarıçap (a)</label>
                      <NumericInput   value={inputs.buyukYaricap||''} onChange={e=>update('buyukYaricap', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Küçük Yarıçap (b)</label>
                      <NumericInput   value={inputs.kucukYaricap||''} onChange={e=>update('kucukYaricap', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 bg-rose-600 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none scale-150">
             {getIcon(inputs.sekil)}
          </div>
          
          {isErr ? (
            <div className="bg-rose-950/50 text-white p-6 rounded-2xl font-bold text-center z-10 w-full">{res.errors?.[0]}</div>
          ) : (
            <div className="z-10 text-center w-full">
               <p className="text-xs font-bold text-rose-300 uppercase tracking-widest flex items-center justify-center gap-2 mb-6">
                 Toplam Yüzey Alanı {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
               </p>
               <div className="text-6xl lg:text-7xl font-black text-white drop-shadow-lg tracking-tighter break-words mb-8">
                 {mounted ? primary.split(' ')[0] : '0'}
                 <span className="text-3xl ml-2 opacity-80">{mounted ? primary.split(' ')[1] : ''}</span>
               </div>
               
               <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-400/30 font-mono text-sm inline-block">
                 <div className="text-rose-300 mb-1 opacity-70">Formül</div>
                 <div className="font-bold text-white">{sr['Kullanılan Formül']}</div>
               </div>
            </div>
          )}
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

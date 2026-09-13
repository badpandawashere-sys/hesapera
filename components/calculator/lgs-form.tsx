
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { Loader2, LayoutGrid, Check, X } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const t = [
  { id: 'turkce', name: 'Türkçe', max: 20 },
  { id: 'matematik', name: 'Matematik', max: 20 },
  { id: 'fen', name: 'Fen Bilimleri', max: 20 },
  { id: 'inkılap', name: 'İnkılap Tarihi', max: 10 },
  { id: 'din', name: 'Din Kültürü', max: 10 },
  { id: 'yabancıDil', name: 'Yabancı Dil', max: 10 }
];

export function LgsForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); handleCalc(); }, []); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    const p: any = {};
    t.forEach(x => { p[x.id+'Correct'] = inputs[x.id+'C']||0; p[x.id+'Wrong'] = inputs[x.id+'W']||0; });
    const resp = await calculateAction(calculator.slug, p);
    if(resp.success) setRes(resp);
    setLoading(false);
  };

  const update = (id: string, type: 'C'|'W', max: number, val: string) => {
    let n = parseInt(val) || 0;
    const sibling = inputs[id + (type==='C'?'W':'C')] || 0;
    if (n < 0) n = 0;
    if (n + sibling > max) n = max - sibling;
    setInputs(prev => ({...prev, [id+type]: n}));
  };

  const primary = parseFloat(res?.data?.primaryResult?.replace(',','.') || '0');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-8 text-blue-900">
          <div className="p-3 bg-blue-100 rounded-xl"><LayoutGrid /></div>
          <h2 className="text-2xl font-bold">LGS Question Grid</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {t.map(x => (
            <div key={x.id} className="bg-slate-50 p-4 rounded-2xl border flex flex-col gap-3">
              <div className="font-bold text-slate-700 flex justify-between">
                {x.name} <span className="text-xs font-normal text-slate-400">Max {x.max}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border rounded-xl px-3 py-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500"/>
                  <input type="number" min="0" max={x.max} value={inputs[x.id+'C']||''} onChange={e=>update(x.id,'C',x.max,e.target.value)} className="w-full font-bold outline-none text-center" placeholder="D" />
                </div>
                <div className="flex-1 bg-white border rounded-xl px-3 py-2 flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500"/>
                  <input type="number" min="0" max={x.max} value={inputs[x.id+'W']||''} onChange={e=>update(x.id,'W',x.max,e.target.value)} className="w-full font-bold outline-none text-center" placeholder="Y" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full flex justify-center mt-6">
              <div className="w-full max-w-[280px]">
                <CalculatorSubmitButton 
                  onClick={handleCalc} 
                  isLoading={loading} 
                  className="!h-[64px] !text-[24px] [&>img]:!h-[42px] shadow-xl hover:shadow-2xl" 
                />
              </div>
            </div>
          <div className="w-full sm:w-1/3 bg-slate-900 text-white p-4 rounded-2xl text-center">
            <span className="text-xs font-semibold text-slate-400">LGS Puanı (Tahmini)</span>
            <div className="text-4xl font-black mt-1 text-blue-400">
              {mounted ? <NumberFlow value={primary} format={{minimumFractionDigits:4}} /> : primary.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}


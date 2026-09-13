
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { BookOpen, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface Props { calculator: CalculatorViewModel; }

export function TytForm({ calculator }: Props) {
  const [inputs, setInputs] = useState({
    turkceCorrect: 0, turkceWrong: 0,
    sosyalCorrect: 0, sosyalWrong: 0,
    matematikCorrect: 0, matematikWrong: 0,
    fenCorrect: 0, fenWrong: 0
  });
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, []); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      if (resp.success) setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const update = (k1: keyof typeof inputs, k2: keyof typeof inputs, max: number, d: number) => {
    const cur = inputs[k1];
    const n = cur + d;
    if (n < 0 || n + inputs[k2] > max) return;
    setInputs(p => ({...p, [k1]: n}));
  };

  const tests = [
    { name: 'Türkçe', max: 40, c: 'turkceCorrect', w: 'turkceWrong', bg: 'bg-rose-50', t: 'text-rose-700' },
    { name: 'Sosyal Bilimler', max: 20, c: 'sosyalCorrect', w: 'sosyalWrong', bg: 'bg-amber-50', t: 'text-amber-700' },
    { name: 'Matematik', max: 40, c: 'matematikCorrect', w: 'matematikWrong', bg: 'bg-blue-50', t: 'text-blue-700' },
    { name: 'Fen Bilimleri', max: 20, c: 'fenCorrect', w: 'fenWrong', bg: 'bg-emerald-50', t: 'text-emerald-700' }
  ];

  const primary = parseFloat(res?.data?.primaryResult?.replace(',', '.') || '0');
  
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><BookOpen /></div>
            <h2 className="text-2xl font-bold text-slate-800">TYT Puanı (Test Matrix)</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {tests.map(t => (
              <div key={t.name} className={`p-4 rounded-2xl ${t.bg} border border-white/50`}>
                <div className={`font-bold ${t.t} mb-3 flex justify-between`}>
                  <span>{t.name}</span>
                  <span className="opacity-60 text-xs">Max: {t.max}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> D</span>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>update(t.c as any, t.w as any, t.max, -1)} className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold text-slate-500">-</button>
                      <span className="w-6 text-center font-bold">{inputs[t.c as keyof typeof inputs]}</span>
                      <button onClick={()=>update(t.c as any, t.w as any, t.max, 1)} className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold text-slate-500">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500"/> Y</span>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>update(t.w as any, t.c as any, t.max, -1)} className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold text-slate-500">-</button>
                      <span className="w-6 text-center font-bold">{inputs[t.w as keyof typeof inputs]}</span>
                      <button onClick={()=>update(t.w as any, t.c as any, t.max, 1)} className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold text-slate-500">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-full flex justify-center mt-6">
              <div className="w-full max-w-[280px]">
                <CalculatorSubmitButton 
                  onClick={handleCalc} 
                  isLoading={loading} 
                  className="!h-[64px] !text-[24px] [&>img]:!h-[42px] shadow-xl hover:shadow-2xl" 
                />
              </div>
            </div>
        </div>

        <div className="w-full lg:w-[350px] bg-slate-50 border rounded-3xl p-6 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">TYT Puanı</span>
            <div className="text-5xl font-black text-slate-900 mt-4">
              {mounted ? <NumberFlow value={primary} format={{minimumFractionDigits:3}} /> : primary.toFixed(3)}
            </div>
          </div>
          <div className="w-full space-y-3 mt-4">
            {Object.keys(res?.data?.secondaryResults || {}).map(k => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                <span className="text-sm font-semibold text-slate-500">{k}</span>
                <span className="text-sm font-bold text-slate-800">{res.data.secondaryResults[k]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


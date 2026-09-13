
'use client';
import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Ruler, Weight, Activity } from 'lucide-react';
import NumberFlow from '@number-flow/react';

export function VkiForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ boy: 175, kilo: 70 });
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

  const update = (k: keyof typeof inputs, val: string) => {
    const num = parseFloat(val) || 0;
    setInputs(p => ({ ...p, [k]: Math.max(0, num) }));
  };

  const bmi = parseFloat(res?.data?.primaryResult || '0');
  
  // Find classification from secondary results safely
  let classification = '-';
  let idealRange = '-';
  if (res?.data?.secondaryResults) {
    const keys = Object.keys(res.data.secondaryResults);
    const kSinif = keys.find(k => k.includes('nflandrma') || k.includes('Sınıf') || k.includes('fland'));
    if (kSinif) classification = res.data.secondaryResults[kSinif];
  }
  if (res?.data?.breakdown) {
    const idealObj = (res.data.breakdown as any[]).find((b) => typeof b.label === 'string' && b.label.includes('deal'));
    if (idealObj) idealRange = idealObj.value;
  }

  // Calculate position on the gauge (min 15, max 40 for visual scale)
  const visualBmi = Math.max(15, Math.min(40, bmi));
  const pos = ((visualBmi - 15) / 25) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Activity className="w-6 h-6"/></div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Vücut Kitle Endeksi</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Health Gauge</p>
            </div>
          </div>
          <div className="space-y-6 pt-2">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Ruler className="w-4 h-4 text-emerald-500"/> Boy (cm)</label>
              <div className="flex items-center gap-4">
                <input type="range" min="100" max="230" step="1" value={inputs.boy} onChange={e=>update('boy', e.target.value)} className="w-full accent-emerald-500" />
                <div className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700">{inputs.boy}</div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Weight className="w-4 h-4 text-emerald-500"/> Kilo (kg)</label>
              <div className="flex items-center gap-4">
                <input type="range" min="30" max="180" step="1" value={inputs.kilo} onChange={e=>update('kilo', e.target.value)} className="w-full accent-emerald-500" />
                <div className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-700">{inputs.kilo}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%]">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative h-full flex flex-col justify-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">Hesaplanan VKİ {loading && <Loader2 className="w-3 h-3 animate-spin"/>}</h3>
              <div className="text-6xl font-black tabular-nums tracking-tighter text-white drop-shadow-lg mb-2">
                {mounted ? <NumberFlow value={bmi} format={{minimumFractionDigits:1, maximumFractionDigits:2}} /> : '0'}
              </div>
              <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold text-emerald-300">
                {classification}
              </div>

              <div className="w-full mt-12 space-y-2 relative">
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-red-500 relative">
                  {/* Gauge marker */}
                  <div className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-8 bg-white border-2 border-slate-900 rounded-full shadow-lg transition-all duration-700 ease-out" style={{left: `${pos}%`}}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </div>

              {idealRange !== '-' && (
                <div className="mt-8 p-4 bg-emerald-950/50 rounded-xl border border-emerald-900/50 w-full text-left">
                  <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider mb-1">Sağlıklı Aralık (WHO)</p>
                  <p className="text-lg font-bold text-emerald-100">{idealRange}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

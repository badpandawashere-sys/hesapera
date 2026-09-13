
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { Loader2, CheckCircle2, XCircle, LayoutDashboard } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const subjs: any = {
  TYT: [
    { id: 'tytTurkce', label: 'TYT Türkçe', max: 40 },
    { id: 'tytSosyal', label: 'TYT Sosyal', max: 20 },
    { id: 'tytMat', label: 'TYT Matematik', max: 40 },
    { id: 'tytFen', label: 'TYT Fen', max: 20 }
  ],
  SAY: [
    { id: 'aytMat', label: 'AYT Matematik', max: 40 },
    { id: 'aytFizik', label: 'AYT Fizik', max: 14 },
    { id: 'aytKimya', label: 'AYT Kimya', max: 13 },
    { id: 'aytBiyo', label: 'AYT Biyoloji', max: 13 }
  ],
  EA: [
    { id: 'aytMat', label: 'AYT Matematik', max: 40 },
    { id: 'aytEdebiyat', label: 'AYT Edebiyat', max: 24 },
    { id: 'aytTarih1', label: 'AYT Tarih-1', max: 10 },
    { id: 'aytCografya1', label: 'AYT Coğrafya-1', max: 6 }
  ],
  SOZ: [
    { id: 'aytEdebiyat', label: 'AYT Edebiyat', max: 24 },
    { id: 'aytTarih1', label: 'AYT Tarih-1', max: 10 },
    { id: 'aytCografya1', label: 'AYT Coğrafya-1', max: 6 },
    { id: 'aytTarih2', label: 'AYT Tarih-2', max: 11 },
    { id: 'aytCografya2', label: 'AYT Coğrafya-2', max: 11 },
    { id: 'aytFelsefe', label: 'AYT Felsefe', max: 12 },
    { id: 'aytDin', label: 'AYT Din K.', max: 6 }
  ],
  DIL: [
    { id: 'ydtDil', label: 'YDT Yabancı Dil', max: 80 }
  ]
};

export function YksForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [pt, setPt] = useState<'TYT'|'SAY'|'EA'|'SOZ'|'DIL'>('SAY');
  const [inputs, setInputs] = useState<Record<string, number>>({ diplomaNotu: 50 });
  const [isKirikObp, setIsKirikObp] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [pt, isKirikObp]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    const payload: any = { puanTuru: pt, isKirikObp, diplomaNotu: inputs.diplomaNotu || 50 };
    
    const allDefs = [...subjs.TYT, ...subjs.SAY, ...subjs.EA, ...subjs.SOZ, ...subjs.DIL];
    allDefs.forEach(d => {
      payload[d.id + 'C'] = inputs[d.id + 'C'] || 0;
      payload[d.id + 'W'] = inputs[d.id + 'W'] || 0;
    });

    try {
      const resp = await calculateAction(calculator.slug, payload);
      if(resp.success) setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const update = (id: string, type: 'C'|'W', max: number, d: number) => {
    const cKey = id + 'C';
    const wKey = id + 'W';
    const curVal = inputs[id + type] || 0;
    const siblingVal = inputs[type === 'C' ? wKey : cKey] || 0;
    
    const n = curVal + d;
    if (n < 0 || n + siblingVal > max) return;
    
    setInputs(p => ({...p, [id + type]: n}));
  };

  const activeSubjects = pt === 'TYT' ? subjs.TYT : [...subjs.TYT, ...subjs[pt]];

  const primary = parseFloat(res?.data?.primaryResult?.replace(',', '.') || '0');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl shadow-sm border p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        
        {/* L: Input Dashboard */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl"><LayoutDashboard /></div>
            <h2 className="text-2xl font-bold text-slate-800">YKS Exam Dashboard</h2>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 block">Puan Türü</label>
            <div className="flex gap-2 flex-wrap">
              {['TYT','SAY','EA','SOZ','DIL'].map(p => (
                <button key={p} onClick={() => setPt(p as any)} className={`px-6 py-2 rounded-full font-bold transition-all ${pt===p ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>{p}</button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {activeSubjects.map((t: any) => (
              <div key={t.id} className="p-4 bg-slate-50 border rounded-2xl">
                <div className="font-bold text-slate-700 mb-3 flex justify-between text-sm">
                  <span>{t.label}</span>
                  <span className="opacity-50">Max: {t.max}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white p-2 border rounded-xl flex items-center justify-between">
                    <span className="text-emerald-500 font-bold text-xs flex gap-1"><CheckCircle2 className="w-4 h-4"/> D</span>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>update(t.id, 'C', t.max, -1)} className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-500">-</button>
                      <span className="w-6 text-center font-bold text-sm">{inputs[t.id+'C']||0}</span>
                      <button onClick={()=>update(t.id, 'C', t.max, 1)} className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-500">+</button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-2 border rounded-xl flex items-center justify-between">
                    <span className="text-red-500 font-bold text-xs flex gap-1"><XCircle className="w-4 h-4"/> Y</span>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>update(t.id, 'W', t.max, -1)} className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-500">-</button>
                      <span className="w-6 text-center font-bold text-sm">{inputs[t.id+'W']||0}</span>
                      <button onClick={()=>update(t.id, 'W', t.max, 1)} className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-500">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Diploma Notu (50-100)</label>
              <input type="number" min="50" max="100" value={inputs.diplomaNotu||''} onChange={e=>setInputs(p=>({...p, diplomaNotu: Number(e.target.value)}))} className="w-full px-4 py-2 border rounded-xl font-bold" />
            </div>
            <div className="flex-1 flex items-center gap-2 pt-4 sm:pt-6">
              <input type="checkbox" id="obp" checked={isKirikObp} onChange={e=>setIsKirikObp(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
              <label htmlFor="obp" className="text-sm font-bold text-slate-700 cursor-pointer">Kırık OBP (Daha önce yerleştim)</label>
            </div>
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

        {/* R: Scorecard */}
        <div className="w-full lg:w-[320px] bg-indigo-950 text-white rounded-3xl p-6 flex flex-col text-center">
          <div className="mt-4 mb-8">
            <h3 className="text-indigo-300 font-semibold text-xs tracking-widest uppercase mb-4">Yerleştirme Puanı</h3>
            <div className="text-6xl font-black drop-shadow-md">
              {mounted ? <NumberFlow value={primary} format={{minimumFractionDigits:3}} /> : primary.toFixed(3)}
            </div>
            <div className="mt-4 inline-block px-4 py-1 rounded-full bg-indigo-900 border border-indigo-700 text-xs font-bold">{pt} Puan Türü</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-2xl p-4 text-left space-y-3">
             {Object.keys(res?.data?.secondaryResults || {}).map(k => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                <span className="text-xs font-medium text-indigo-200">{k}</span>
                <span className="text-sm font-bold text-white">{res.data.secondaryResults[k]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}


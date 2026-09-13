
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Calendar, Clock, Cake } from 'lucide-react';
import NumberFlow from '@number-flow/react';

export function AgeForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ birthDate: '1990-01-01', targetDate: new Date().toISOString().split('T')[0] });
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
  const ageYears = parseInt(primaryStr) || 0;
  
  let m=0, d=0, totalD=0;
  if(res?.data?.secondaryResults) {
    const sr = res.data.secondaryResults;
    const vals = Object.values(sr) as any[];
    m = vals[1] || 0;
    d = vals[2] || 0;
    totalD = vals[3] ? parseInt(String(vals[3]).replace(/[^0-9]/g, '')) : 0;
  }

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="w-full lg:w-[40%] flex flex-col gap-8 relative z-10">
          <div>
            <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl w-fit mb-4"><Calendar className="w-6 h-6"/></div>
            <h2 className="text-3xl font-black text-white">Zaman Çizelgesi</h2>
            <p className="text-sm font-medium text-slate-400 mt-2">Dünyada geçirdiğiniz süreyi saniye saniye hissedin.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Doğum Tarihi</label>
              <input type="date" value={inputs.birthDate} onChange={e=>setInputs(p=>({...p, birthDate: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-purple-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hedef Tarih (Varsayılan Bugün)</label>
              <input type="date" value={inputs.targetDate} onChange={e=>setInputs(p=>({...p, targetDate: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-purple-500" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[60%] flex flex-col justify-center relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
             <Clock className="w-4 h-4"/> Geçen Süre {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
          </div>
          
          <div className="flex flex-wrap items-baseline gap-4 mb-10 border-b border-white/10 pb-10">
             <div className="flex items-baseline gap-2">
               <span className="text-7xl font-black tracking-tighter drop-shadow-md">{mounted ? <NumberFlow value={ageYears} /> : '0'}</span>
               <span className="text-xl font-bold text-slate-500 uppercase">Yıl</span>
             </div>
             <div className="flex items-baseline gap-2">
               <span className="text-5xl font-black text-white/80">{mounted ? <NumberFlow value={m} /> : '0'}</span>
               <span className="text-lg font-bold text-slate-500 uppercase">Ay</span>
             </div>
             <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black text-white/60">{mounted ? <NumberFlow value={d} /> : '0'}</span>
               <span className="text-base font-bold text-slate-500 uppercase">Gün</span>
             </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><Cake className="w-5 h-5 text-purple-400"/></div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dünyada geçen toplam gün</div>
            </div>
            <div className="text-2xl font-black text-purple-300 tabular-nums tracking-wider">
              {mounted ? <NumberFlow value={totalD} /> : '0'}
            </div>
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

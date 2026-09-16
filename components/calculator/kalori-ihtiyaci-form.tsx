
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Flame, User, Ruler, Weight } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function KaloriIhtiyaciForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ cinsiyet: 'Erkek', yas: 30, boy: 175, kilo: 70, aktiviteFaktoru: 1.55 });
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
    if(k === 'cinsiyet') setInputs(p => ({ ...p, [k]: val }));
    else setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const primaryStr = res?.data?.primaryResult || '0';
  const tdee = parseFloat(primaryStr.replace(/[^0-9.]/g, '')) || 0;
  
  let bmr = 0;
  if (res?.data?.secondaryResults) {
    const keys = Object.keys(res.data.secondaryResults);
    const kBmr = keys.find(k => k.includes('BMR'));
    if (kBmr) bmr = parseFloat(res.data.secondaryResults[kBmr].replace(/[^0-9.]/g, '')) || 0;
  }
  const activeBurn = Math.max(0, tdee - bmr);
  const pBmr = tdee ? (bmr / tdee) * 100 : 0;
  const pAct = tdee ? (activeBurn / tdee) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Flame className="w-6 h-6"/></div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Kalori İhtiyacı</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Energy Dashboard</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button onClick={()=>update('cinsiyet', 'Erkek')} className={`py-2 text-sm font-bold rounded-md transition-all ${inputs.cinsiyet==='Erkek'?'bg-white shadow-sm text-orange-600':'text-slate-500'}`}>Erkek</button>
              <button onClick={()=>update('cinsiyet', 'Kadın')} className={`py-2 text-sm font-bold rounded-md transition-all ${inputs.cinsiyet==='Kadın'?'bg-white shadow-sm text-orange-600':'text-slate-500'}`}>Kadın</button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Yaş</label>
                <NumericInput   value={inputs.yas||''} onChange={e=>update('yas', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center font-bold outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Boy (cm)</label>
                <NumericInput   value={inputs.boy||''} onChange={e=>update('boy', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center font-bold outline-none focus:border-orange-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Kilo (kg)</label>
                <NumericInput   value={inputs.kilo||''} onChange={e=>update('kilo', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center font-bold outline-none focus:border-orange-400" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Aktivite Seviyesi</label>
              <select value={inputs.aktiviteFaktoru} onChange={e=>update('aktiviteFaktoru', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-sm outline-none focus:border-orange-400">
                <option value={1.2}>Masa Başı (Hareketsiz)</option>
                <option value={1.375}>Hafif Aktif (Haftada 1-3 gün)</option>
                <option value={1.55}>Orta Aktif (Haftada 3-5 gün)</option>
                <option value={1.725}>Çok Aktif (Haftada 6-7 gün)</option>
                <option value={1.9}>Aşırı Aktif (Ağır idman)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%]">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-center h-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
              <span>Günlük Enerji İhtiyacı (TDEE)</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
            </h3>
            <div className="text-5xl font-black text-slate-800 tracking-tighter mb-10 flex items-baseline gap-2">
              {mounted ? <NumberFlow value={tdee} format={{maximumFractionDigits:0}} /> : '0'} <span className="text-xl text-slate-400 font-bold">kcal</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-orange-600">Bazal (BMR)</span>
                <span className="text-yellow-500">Aktivite</span>
              </div>
              <div className="w-full h-8 bg-slate-200 rounded-full flex overflow-hidden shadow-inner">
                <div style={{width:`${pBmr}%`}} className="bg-orange-500 transition-all duration-700"></div>
                <div style={{width:`${pAct}%`}} className="bg-yellow-400 transition-all duration-700 border-l border-white/20"></div>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-700 pt-2">
                <span>{mounted ? <NumberFlow value={bmr} /> : 0} kcal</span>
                <span>{mounted ? <NumberFlow value={activeBurn} /> : 0} kcal</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}


'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { BookMarked, Plus, Trash2, Loader2 } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function DersNotuForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [type, setType] = useState<'basit'|'agirlikli'>('basit');
  const [notlar, setNotlar] = useState([{ id: Date.now(), not: 50, agirlik: 1 }]);
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [type, notlar]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    const payload = {
      hesaplamaTuru: type,
      notlar: notlar.map(n => ({ not: n.not, agirlik: n.agirlik }))
    };
    const resp = await calculateAction(calculator.slug, payload);
    if(resp.success) setRes(resp);
    setLoading(false);
  };

  const addNot = () => setNotlar(p => [...p, { id: Date.now(), not: 50, agirlik: 1 }]);
  const rmNot = (id: number) => {
    if (notlar.length > 1) setNotlar(p => p.filter(x => x.id !== id));
  };
  const update = (id: number, field: string, val: string) => {
    let num = parseFloat(val) || 0;
    if (field === 'not') num = Math.min(100, Math.max(0, num));
    setNotlar(p => p.map(x => x.id === id ? { ...x, [field]: num } : x));
  };

  const primary = parseFloat(res?.data?.primaryResult?.replace(',','.') || '0');

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><BookMarked /></div>
        <h2 className="text-2xl font-bold text-slate-800">Ders Notu (Gradebook)</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={()=>setType('basit')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${type==='basit'?'bg-emerald-600 text-white':'bg-slate-100 text-slate-600'}`}>Basit Ortalama</button>
        <button onClick={()=>setType('agirlikli')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${type==='agirlikli'?'bg-emerald-600 text-white':'bg-slate-100 text-slate-600'}`}>Ağırlıklı Ortalama</button>
      </div>

      <div className="space-y-3 mb-6">
        {notlar.map((n, i) => (
          <div key={n.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border">
            <div className="font-bold text-slate-400 w-8 text-center">{i+1}.</div>
            <div className="flex-1 flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Not (0-100)</label>
                <NumericInput   min="0" max="100" value={n.not||''} onChange={e=>update(n.id, 'not', e.target.value)} className="w-full px-4 py-2 border rounded-xl font-bold" />
              </div>
              {type === 'agirlikli' && (
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Ağırlık/Kredi</label>
                  <NumericInput   min="0" value={n.agirlik||''} onChange={e=>update(n.id, 'agirlik', e.target.value)} className="w-full px-4 py-2 border rounded-xl font-bold" />
                </div>
              )}
            </div>
            <button onClick={()=>rmNot(n.id)} disabled={notlar.length <= 1} className="w-10 h-10 mt-5 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 disabled:opacity-30 disabled:hover:bg-red-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button onClick={addNot} className="w-full py-4 border-2 border-dashed border-emerald-200 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-50 transition-all flex justify-center items-center gap-2 mb-8">
        <Plus className="w-5 h-5"/> Yeni Not Ekle
      </button>

      <div className="bg-slate-900 rounded-3xl p-6 lg:p-8 flex items-center justify-between">
        <div>
          <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">DÖNEM SONU</span>
          <h3 className="text-white font-medium text-lg">Ders Ortalaması</h3>
        </div>
        <div className="text-5xl font-black text-white">
           {mounted ? <NumberFlow value={primary} format={{minimumFractionDigits:2}} /> : primary.toFixed(2)}
        </div>
      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

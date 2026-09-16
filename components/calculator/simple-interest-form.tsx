
'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Plus, Equal, Coins, CalendarDays, Percent } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function SimpleInterestForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({
    principal: 10000,
    annualRate: 20,
    termYears: 3
  });
  
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

  const updateInput = (k: keyof typeof inputs, val: string) => {
    const num = parseFloat(val) || 0;
    setInputs(prev => ({ ...prev, [k]: Math.max(0, num) }));
  };

  // Helper to parse localized string like "1.234,56" to 1234.56
  const parseNum = (str: any) => {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const clean = String(str).replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const primary = parseNum(res?.data?.primaryResult || '0');
  
  let principalVal = 0, interestVal = 0;
  if (res?.data?.secondaryResults) {
    const keys = Object.keys(res.data.secondaryResults);
    const kPrin = keys.find(k => k.toLowerCase().includes('anapara'));
    const kInt = keys.find(k => k.toLowerCase().includes('faiz tutar'));
    
    principalVal = kPrin ? parseNum(res.data.secondaryResults[kPrin]) : 0;
    interestVal = kInt ? parseNum(res.data.secondaryResults[kInt]) : 0;
  }

  const total = primary || 1;
  const pPrin = (principalVal / total) * 100;
  const pInt = (interestVal / total) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-white rounded-3xl shadow-sm border-2 border-slate-900 p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Inputs */}
        <div className="w-full lg:w-[45%] flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Basit Faiz</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Doğrusal Büyüme Modeli</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 bg-white p-5 border-2 border-slate-200 rounded-2xl focus-within:border-indigo-600 transition-colors">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Coins className="w-5 h-5 text-indigo-600"/> Anapara (₺)</label>
              <NumericInput   value={inputs.principal||''} onChange={e=>updateInput('principal', e.target.value)} className="w-full text-2xl font-black bg-transparent outline-none text-slate-900" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 bg-white p-5 border-2 border-slate-200 rounded-2xl focus-within:border-indigo-600 transition-colors">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Percent className="w-5 h-5 text-indigo-600"/> Yıllık Oran</label>
                <NumericInput   value={inputs.annualRate||''} onChange={e=>updateInput('annualRate', e.target.value)} className="w-full text-2xl font-black bg-transparent outline-none text-slate-900" />
              </div>
              <div className="space-y-3 bg-white p-5 border-2 border-slate-200 rounded-2xl focus-within:border-indigo-600 transition-colors">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-indigo-600"/> Vade (Yıl)</label>
                <NumericInput   value={inputs.termYears||''} onChange={e=>updateInput('termYears', e.target.value)} className="w-full text-2xl font-black bg-transparent outline-none text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer (Linear / Minimalist Tape UI) */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold tracking-widest text-sm text-slate-500 uppercase">Toplam Tutar</h3>
              {loading && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
            </div>

            <div className="text-5xl md:text-7xl font-black text-slate-900 tabular-nums tracking-tighter mb-12">
              {mounted ? <NumberFlow value={primary} format={{style:'currency', currency:'TRY', minimumFractionDigits:0, maximumFractionDigits:2}} /> : '0 ₺'}
            </div>

            {/* The Linear Tape */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Anapara (%{pPrin.toFixed(0)})</span>
                <span>Faiz (%{pInt.toFixed(0)})</span>
              </div>
              
              <div className="h-12 w-full flex gap-1 rounded-lg overflow-hidden">
                <div style={{width: `${Math.max(pPrin, 5)}%`}} className="bg-indigo-600 h-full transition-all duration-700"></div>
                <div style={{width: `${Math.max(pInt, 5)}%`}} className="bg-amber-400 h-full transition-all duration-700"></div>
              </div>

              {/* Mathematical Equation Breakdown */}
              <div className="flex items-center justify-between pt-6">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-1">Anapara</span>
                  <span className="text-xl font-black text-indigo-600">
                    {mounted ? <NumberFlow value={principalVal} format={{style:'currency', currency:'TRY', maximumFractionDigits:0}} /> : '0 ₺'}
                  </span>
                </div>
                <Plus className="w-6 h-6 text-slate-300" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-1">Faiz Tutarı</span>
                  <span className="text-xl font-black text-amber-500">
                    {mounted ? <NumberFlow value={interestVal} format={{style:'currency', currency:'TRY', maximumFractionDigits:0}} /> : '0 ₺'}
                  </span>
                </div>
                <Equal className="w-6 h-6 text-slate-300" />
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-1">Toplam</span>
                  <span className="text-xl font-black text-slate-900">
                    {mounted ? <NumberFlow value={primary} format={{style:'currency', currency:'TRY', maximumFractionDigits:0}} /> : '0 ₺'}
                  </span>
                </div>
              </div>
            </div>

          </div>
          
          {(res?.data?.notes?.length > 0) && (
            <div className="mt-6 flex flex-col gap-2 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl">
              {res.data.notes.map((n:string, idx:number) => (
                <p key={idx} className="text-xs font-bold text-slate-600 uppercase tracking-wide leading-relaxed">
                  • {n}
                </p>
              ))}
            </div>
          )}
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

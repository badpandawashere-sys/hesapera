
'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, PiggyBank, Target, TrendingUp, Wallet, Info } from 'lucide-react';
import NumberFlow from '@number-flow/react';

export function SavingsForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({
    initialDeposit: 10000,
    periodicContribution: 2000,
    annualInterestRate: 40,
    termMonths: 36
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

  // Extract raw number from formatted currency string (e.g. "10.000,50 ₺")
  const parseCurrency = (str: string) => {
    if (!str) return 0;
    const clean = str.replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const primary = parseCurrency(res?.data?.primaryResult || '0');
  
  // Safely extract secondary results to build the visual composition bar
  let initial = 0, contribution = 0, growth = 0;
  if (res?.data?.secondaryResults) {
    const keys = Object.keys(res.data.secondaryResults);
    const kInit = keys.find(k => k.includes('lang') || k.includes('Birikim'));
    const kCont = keys.find(k => k.includes('zenli') || k.includes('Katk'));
    const kGrow = keys.find(k => k.includes('Getiri') || k.includes('Kazan'));
    
    initial = kInit ? parseCurrency(res.data.secondaryResults[kInit]) : 0;
    contribution = kCont ? parseCurrency(res.data.secondaryResults[kCont]) : 0;
    growth = kGrow ? parseCurrency(res.data.secondaryResults[kGrow]) : 0;
  }

  const total = primary || 1; // avoid div by zero
  const pInit = (initial / total) * 100;
  const pCont = (contribution / total) * 100;
  const pGrow = (growth / total) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Inputs */}
        <div className="w-full lg:w-[45%] space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-teal-100 text-teal-700 rounded-2xl"><PiggyBank className="w-6 h-6"/></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Birikim Yolculuğu</h2>
              <p className="text-sm font-medium text-slate-500">Gelecekteki varlığınızı inşaa edin</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Wallet className="w-4 h-4"/> Başlangıç Tutarı (₺)</label>
              <input type="number" value={inputs.initialDeposit||''} onChange={e=>updateInput('initialDeposit', e.target.value)} className="w-full text-xl font-bold bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 ring-teal-500 outline-none transition-all" />
              <input type="range" min="0" max="500000" step="1000" value={inputs.initialDeposit} onChange={e=>updateInput('initialDeposit', e.target.value)} className="w-full accent-teal-500" />
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Aylık Katkı (₺)</label>
              <input type="number" value={inputs.periodicContribution||''} onChange={e=>updateInput('periodicContribution', e.target.value)} className="w-full text-xl font-bold bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 ring-teal-500 outline-none transition-all" />
              <input type="range" min="0" max="50000" step="500" value={inputs.periodicContribution} onChange={e=>updateInput('periodicContribution', e.target.value)} className="w-full accent-teal-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yıllık Getiri (%)</label>
                <input type="number" value={inputs.annualInterestRate||''} onChange={e=>updateInput('annualInterestRate', e.target.value)} className="w-full text-lg font-bold bg-white border border-slate-200 p-3 rounded-xl outline-none" />
              </div>
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Süre (Ay)</label>
                <input type="number" value={inputs.termMonths||''} onChange={e=>updateInput('termMonths', e.target.value)} className="w-full text-lg font-bold bg-white border border-slate-200 p-3 rounded-xl outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-teal-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2"><Target className="w-4 h-4"/> Ulaşılan Varlık</h3>
                   {loading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
                </div>
                <div className="text-5xl md:text-6xl font-black tabular-nums tracking-tight">
                  {mounted ? <NumberFlow value={primary} format={{style:'currency', currency:'TRY', minimumFractionDigits:0, maximumFractionDigits:0}} /> : '0 ₺'}
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Varlık Kompozisyonu</span>
                  </div>
                  {/* The Composition Bar */}
                  <div className="h-4 md:h-6 w-full rounded-full bg-slate-800 flex overflow-hidden shadow-inner">
                    <div style={{width: `${pInit}%`}} className="bg-slate-500 transition-all duration-1000"></div>
                    <div style={{width: `${pCont}%`}} className="bg-blue-500 transition-all duration-1000 border-l border-slate-900/20"></div>
                    <div style={{width: `${pGrow}%`}} className="bg-teal-400 transition-all duration-1000 border-l border-slate-900/20"></div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <div className="w-2 h-2 rounded-full bg-slate-500"></div> Başlangıç
                    </div>
                    <div className="font-bold text-sm">
                      {mounted ? <NumberFlow value={initial} format={{style:'currency', currency:'TRY', maximumFractionDigits:0}} /> : '0 ₺'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> Katkılar
                    </div>
                    <div className="font-bold text-sm">
                      {mounted ? <NumberFlow value={contribution} format={{style:'currency', currency:'TRY', maximumFractionDigits:0}} /> : '0 ₺'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div> Büyüme
                    </div>
                    <div className="font-bold text-sm text-teal-300">
                      {mounted ? <NumberFlow value={growth} format={{style:'currency', currency:'TRY', maximumFractionDigits:0}} /> : '0 ₺'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {(res?.data?.notes?.length > 0) && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-slate-500 leading-relaxed">{res.data.notes[0]}</p>
            </div>
          )}
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

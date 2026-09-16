
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, BatteryCharging, DollarSign } from 'lucide-react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function MaxLoanAmountForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ maxMonthlyPayment: 15000, monthlyInterestRate: 3.5, termMonths: 36, existingMonthlyDebt: 5000 });
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
    setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const primary = res?.data?.primaryResult || '0 ₺';
  const sr = res?.data?.secondaryResults || {};
  const isErr = (inputs.maxMonthlyPayment - inputs.existingMonthlyDebt) <= 0;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        
        <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
           <div>
             <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-3">
                <BatteryCharging className="w-6 h-6 text-indigo-600"/>
                Kredi Kapasitesi
             </h2>
             <p className="text-sm font-medium text-indigo-700/70 mt-1">Geri ödeme gücünüze göre tahmini kredi limitiniz</p>
           </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aylık Ödeyebileceğiniz Maks Tutar</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                <NumericInput   value={inputs.maxMonthlyPayment||''} onChange={e=>update('maxMonthlyPayment', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xl outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mevcut Aylık Kredi/Kart Taksitleriniz</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                <NumericInput   value={inputs.existingMonthlyDebt||''} onChange={e=>update('existingMonthlyDebt', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xl outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aylık Faiz (%)</label>
                <NumericInput   step="0.01" value={inputs.monthlyInterestRate||''} onChange={e=>update('monthlyInterestRate', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-indigo-500 transition-colors text-center" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vade (Ay)</label>
                <NumericInput   value={inputs.termMonths||''} onChange={e=>update('termMonths', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-lg outline-none focus:border-indigo-500 transition-colors text-center" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {isErr ? (
               <div className="bg-red-50 border border-red-200 p-8 rounded-[2rem] text-center">
                 <h3 className="text-xl font-black text-red-600 mb-2">Kapasite Yok</h3>
                 <p className="text-sm font-bold text-red-500/80">Mevcut borcunuz, ödeyebileceğiniz tutarı aşıyor veya ona eşit.</p>
               </div>
            ) : (
               <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-center text-white relative shadow-xl shadow-indigo-200 overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                 
                 <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                   Tahmini Kredi Limiti {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                 </p>
                 <div className="text-5xl font-black drop-shadow-md mb-8">
                   {mounted ? primary : '0 ₺'}
                 </div>
                 
                 <div className="bg-indigo-900/50 p-4 rounded-2xl border border-indigo-500/30">
                   <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Boşta Kalan Ödeme Gücü</p>
                   <p className="text-xl font-black text-white">{sr['Kullanılabilir Aylık Ödeme']}</p>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

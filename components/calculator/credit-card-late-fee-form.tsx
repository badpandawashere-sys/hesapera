
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, AlertTriangle, Clock } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function CreditCardLateFeeForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ overdueAmount: 10000, monthlyDelayRate: 4.25, delayDays: 15 });
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [inputs]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      if (resp.success) setRes(resp);
      else setRes({error: resp.errors?.[0]});
    } catch(e) {}
    setLoading(false);
  };

  const update = (k: keyof typeof inputs, val: string) => {
    setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const isErr = !!res?.error;
  const primary = res?.data?.primaryResult || '0 ₺';
  const sr = res?.data?.secondaryResults || {};

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="bg-orange-50 border border-orange-200 rounded-[2.5rem] p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-orange-200 text-orange-700 rounded-xl"><AlertTriangle className="w-6 h-6"/></div>
             <div>
               <h2 className="text-2xl font-black text-orange-900 tracking-tight">Gecikme Maliyeti</h2>
               <p className="text-xs font-bold text-orange-600/70 uppercase tracking-widest mt-1">Kredi Kartı Bakiye</p>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geciken Tutar (TL)</label>
              <NumericInput   value={inputs.overdueAmount||''} onChange={e=>update('overdueAmount', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xl outline-none focus:border-orange-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gecikme (Gün)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                  <NumericInput   value={inputs.delayDays||''} onChange={e=>update('delayDays', e.target.value)} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aylık Faiz (%)</label>
                <NumericInput   step="0.01" value={inputs.monthlyDelayRate||''} onChange={e=>update('monthlyDelayRate', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 outline-none focus:border-orange-400 text-center" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          {isErr ? (
            <div className="bg-white/50 text-orange-700 p-6 rounded-2xl font-bold border border-orange-300 text-center">{res.error}</div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-200 shadow-xl shadow-orange-900/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-2 bg-orange-500"></div>
               
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center mb-6">
                 <span>Tahmini Gecikme Faizi</span>
                 {loading && <Loader2 className="w-3 h-3 animate-spin text-orange-500"/>}
               </p>
               
               <div className="text-6xl font-black text-orange-600 tracking-tighter mb-8 drop-shadow-sm">
                 {mounted ? primary : '0 ₺'}
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-100">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">Asıl Borç</span>
                   <span className="font-black text-slate-800">{sr['Gecikmeye Giren Tutar']}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">Saf Gecikme Faizi</span>
                   <span className="font-black text-slate-800">{sr['Saf Gecikme Faizi']}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">KKDF (%15)</span>
                   <span className="font-black text-slate-800">{sr['KKDF (%15)']}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-500">BSMV (%15)</span>
                   <span className="font-black text-slate-800">{sr['BSMV (%15)']}</span>
                 </div>
                 <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100 mt-4">
                   <span className="text-sm font-bold text-orange-900">Ödenecek Toplam Tutar</span>
                   <span className="text-xl font-black text-orange-700">{sr['Toplam Ödenecek Tutar']}</span>
                 </div>
               </div>
            </div>
          )}
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

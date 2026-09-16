
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Landmark, PieChart, Banknote } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function LoanAnnualCostRateForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ 
    loanType: 'ihtiyac', principal: 100000, monthlyInterestRate: 3.5, termMonths: 12, 
    allocationFee: 500, insuranceFee: 1500, appraisalFee: 0, mortgageFee: 0, otherFees: 0 
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
      else setRes({error: resp.errors?.[0]});
    } catch(e) {}
    setLoading(false);
  };

  const update = (k: keyof typeof inputs, val: any) => {
    if(k === 'loanType') setInputs(p => ({ ...p, [k]: val }));
    else setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
  };

  const isErr = !!res?.error;
  const primary = res?.data?.primaryResult || '%0.0000';
  const sr = res?.data?.secondaryResults || {};

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
             <div className="p-3 bg-teal-100 text-teal-700 rounded-xl"><Landmark className="w-6 h-6"/></div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gerçek Maliyet</h2>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Yıllık Efektif Oran</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kredi Türü</label>
              <select value={inputs.loanType} onChange={e=>update('loanType', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none">
                <option value="ihtiyac">İhtiyaç</option>
                <option value="tasit">Taşıt</option>
                <option value="konut">Konut</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tutar (TL)</label>
              <NumericInput   value={inputs.principal||''} onChange={e=>update('principal', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Vade (Ay)</label>
              <NumericInput   value={inputs.termMonths||''} onChange={e=>update('termMonths', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Aylık Faiz (%)</label>
              <NumericInput   step="0.01" value={inputs.monthlyInterestRate||''} onChange={e=>update('monthlyInterestRate', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tahsis Ücreti</label>
              <NumericInput   value={inputs.allocationFee||''} onChange={e=>update('allocationFee', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Sigorta</label>
              <NumericInput   value={inputs.insuranceFee||''} onChange={e=>update('insuranceFee', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Diğer Masraflar</label>
              <NumericInput   value={inputs.otherFees||''} onChange={e=>update('otherFees', e.target.value)} className="w-full p-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] flex flex-col justify-center">
           {isErr ? (
             <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100">{res.error}</div>
           ) : (
             <div className="bg-teal-900 rounded-[2rem] p-8 text-white relative shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10">
                 <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex justify-between items-center mb-2">
                   <span>Yıllık Efektif Maliyet Oranı</span>
                   {loading && <Loader2 className="w-3 h-3 animate-spin"/>}
                 </h3>
                 <div className="text-6xl font-black text-white drop-shadow-md mb-8 tracking-tighter">
                   {mounted ? primary : '%0'}
                 </div>

                 <div className="space-y-3">
                   <div className="flex justify-between items-center bg-teal-950/50 p-4 rounded-xl border border-teal-800">
                     <span className="text-xs font-bold text-teal-300 flex items-center gap-2"><Banknote className="w-4 h-4"/> Net Eline Geçen</span>
                     <span className="font-black text-white">{sr['Net Kullanılan Kredi']}</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="text-[10px] font-bold text-slate-400 uppercase">Peşin Masraf</div>
                       <div className="font-bold text-teal-200 mt-1">{sr['Toplam Peşin Ek Maliyet']}</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Faiz</div>
                       <div className="font-bold text-teal-200 mt-1">{sr['Toplam Faiz']}</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Vergi</div>
                       <div className="font-bold text-teal-200 mt-1">{sr['Toplam Vergi (BSMV+KKDF)']}</div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="text-[10px] font-bold text-slate-400 uppercase">Aylık Taksit</div>
                       <div className="font-bold text-teal-200 mt-1">{sr['Aylık Taksit']}</div>
                     </div>
                   </div>

                   <div className="mt-4 pt-4 border-t border-teal-800 flex justify-between items-center">
                     <span className="text-sm font-bold text-teal-400">Toplam Geri Ödeme</span>
                     <span className="text-xl font-black text-white">{sr['Toplam Geri Ödeme']}</span>
                   </div>
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

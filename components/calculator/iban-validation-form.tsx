
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, ShieldCheck, ShieldAlert, Fingerprint } from 'lucide-react';

export function IbanValidationForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ iban: '' });
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []); // eslint-disable-line

  const handleCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputs.iban.trim()) return;
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const isSuccessResult = res?.data?.primaryResult === 'IBAN Geçerli';
  const sr = res?.data?.secondaryResults || {};
  const isErr = res?.success === false;

  return (
    <div className="w-full max-w-3xl mx-auto font-sans">
      <div className="bg-slate-900 text-slate-300 rounded-[2.5rem] shadow-2xl p-8 lg:p-12">
        
        <div className="flex flex-col items-center text-center mb-10">
           <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
             <Fingerprint className="w-8 h-8"/>
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-widest font-mono">IBAN Çözümleyici</h2>
           <p className="text-sm font-medium text-slate-500 mt-2">Uluslararası hesap numarasının matematiksel sınaması</p>
        </div>

        <form onSubmit={handleCalc} className="relative mb-10">
          <input 
             type="text" 
             placeholder="TR..." 
             value={inputs.iban} 
             onChange={e=>setInputs({iban: e.target.value.toUpperCase()})}
             className="w-full bg-slate-950 border-2 border-slate-700 focus:border-blue-500 rounded-2xl p-6 text-xl md:text-2xl font-mono text-white outline-none tracking-widest transition-colors uppercase placeholder:text-slate-700" 
          />
          <button type="submit" disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'DOĞRULA'}
          </button>
        </form>

        {isErr && (
          <div className="bg-red-950/50 border border-red-900/50 p-6 rounded-2xl text-center font-bold text-red-400">
            {res.errors?.[0] || 'Bir hata oluştu.'}
          </div>
        )}

        {res?.data && !isErr && (
          <div className={`p-8 rounded-3xl border-2 transition-colors ${isSuccessResult ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-red-950/30 border-red-900/50'}`}>
             <div className="flex items-center gap-4 mb-8">
               {isSuccessResult ? <ShieldCheck className="w-10 h-10 text-emerald-400"/> : <ShieldAlert className="w-10 h-10 text-red-400"/>}
               <h3 className={`text-3xl font-black uppercase ${isSuccessResult ? 'text-emerald-400' : 'text-red-400'}`}>
                 {res.data.primaryResult}
               </h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
               {Object.keys(sr).filter(k=>k!=='Yapısal Çözümleme').map(k => (
                 <div key={k} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{k}</div>
                   <div className={`font-bold ${k==='Hata Nedeni' ? 'text-red-300' : 'text-white'}`}>{sr[k]}</div>
                 </div>
               ))}
             </div>
             
             {sr['Yapısal Çözümleme'] && (
               <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm">
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Yapısal Çözümleme (Türkiye)</div>
                 <div className="space-y-2">
                   <div className="flex justify-between border-b border-slate-800 pb-2"><span>Banka Kodu:</span> <span className="text-blue-300 font-bold">{sr['Yapısal Çözümleme']['Banka Kodu']}</span></div>
                   <div className="flex justify-between border-b border-slate-800 pb-2"><span>Rezerv Alan:</span> <span className="text-white font-bold">{sr['Yapısal Çözümleme']['Rezerv Alan (0)']}</span></div>
                   <div className="flex justify-between"><span>Hesap No:</span> <span className="text-emerald-300 font-bold">{sr['Yapısal Çözümleme']['Hesap Numarası']}</span></div>
                 </div>
               </div>
             )}
          </div>
        )}

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

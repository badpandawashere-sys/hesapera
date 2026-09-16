
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Link, Plus, Trash2 } from 'lucide-react';

export function EbobEkokForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [inputs, setInputs] = useState({ numbers: [{value: 12}, {value: 18}] });
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); handleCalc(); }, [inputs]); // eslint-disable-line

  const handleCalc = async () => {
    setLoading(true);
    try {
      const resp = await calculateAction(calculator.slug, inputs);
      setRes(resp);
    } catch(e) {}
    setLoading(false);
  };

  const update = (i: number, val: string) => {
    const arr = [...inputs.numbers];
    arr[i].value = parseInt(val) || 0;
    setInputs({ numbers: arr });
  };
  const addNum = () => setInputs({ numbers: [...inputs.numbers, {value: 0}] });
  const remNum = (i: number) => {
    if(inputs.numbers.length > 2) {
       const arr = [...inputs.numbers];
       arr.splice(i, 1);
       setInputs({ numbers: arr });
    }
  };

  const isErr = res?.success === false;
  const primary = res?.data?.primaryResult || '';
  const ebobStr = primary.includes('|') ? primary.split('|')[0].replace('EBOB:','').trim() : '0';
  const ekokStr = primary.includes('|') ? primary.split('|')[1].replace('EKOK:','').trim() : '0';

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl shadow-slate-200/50 flex flex-col items-center">
        
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-fuchsia-200">
             <Link className="w-8 h-8"/>
           </div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ortak Bölen & Kat</h2>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">EBOB — EKOK</p>
        </div>
        
        <div className="w-full max-w-lg space-y-4 mb-10">
          {inputs.numbers.map((num, i) => (
             <div key={i} className="relative flex items-center">
               <input 
                 type="number" 
                 value={num.value || ''} 
                 onChange={e=>update(i, e.target.value)} 
                 className="w-full p-6 text-2xl font-black text-center bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-fuchsia-300 transition-colors"
                 placeholder={`${i+1}. Sayı`}
               />
               {inputs.numbers.length > 2 && (
                 <button onClick={()=>remNum(i)} className="absolute right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
               )}
             </div>
          ))}
          <button onClick={addNum} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-fuchsia-200 transition-colors">
            <Plus className="w-4 h-4"/> Yeni Sayı Ekle
          </button>
        </div>

        {isErr ? (
           <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100 w-full max-w-lg text-center">{res.errors?.[0]}</div>
        ) : (
           <div className="grid grid-cols-2 gap-4 w-full max-w-lg relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-full border-4 border-slate-50 flex items-center justify-center z-10 text-slate-300">
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Link className="w-4 h-4"/>}
              </div>

              <div className="bg-fuchsia-600 text-white rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
                <div className="text-[10px] font-bold text-fuchsia-200 uppercase tracking-widest mb-2">EBOB</div>
                <div className="text-4xl md:text-5xl font-black drop-shadow-md">{mounted ? ebobStr : '0'}</div>
                <div className="text-[9px] text-fuchsia-300 uppercase mt-4 opacity-70">En Büyük Ortak Bölen</div>
              </div>
              
              <div className="bg-sky-500 text-white rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
                <div className="text-[10px] font-bold text-sky-200 uppercase tracking-widest mb-2">EKOK</div>
                <div className="text-4xl md:text-5xl font-black drop-shadow-md">{mounted ? ekokStr : '0'}</div>
                <div className="text-[9px] text-sky-200 uppercase mt-4 opacity-70">En Küçük Ortak Kat</div>
              </div>
           </div>
        )}

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

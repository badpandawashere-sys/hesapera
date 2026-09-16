
'use client';
import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Award, Loader2 } from 'lucide-react';
import { NumericInput } from '@/components/calculator/numeric-input';

export function TakdirTesekkurForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [level, setLevel] = useState<'Ortaokul'|'Lise'>('Lise');
  const [ort, setOrt] = useState(86);
  const [fail, setFail] = useState(false);
  const [devamsizlik, setDevamsizlik] = useState(0);
  const [disiplin, setDisiplin] = useState(false);
  const [turkce, setTurkce] = useState(100);
  
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calc = async () => {
    setLoading(true);
    const p: any = {
      egitimSeviyesi: level, donemOrtalamasi: ort,
      basarisizDersVarMi: fail, ozursuzDevamsizlik: devamsizlik, disiplinCezasiVarMi: disiplin
    };
    if (level === 'Ortaokul') p.turkceDersiNotu = turkce;
    
    const r = await calculateAction(calculator.slug, p);
    setRes(r); setLoading(false);
  };
  useEffect(() => { calc(); }, [level, ort, fail, devamsizlik, disiplin, turkce]); // eslint-disable-line

  const title = res?.data?.primaryResult || 'Hesaplanıyor...';
  
  const isTakdir = title.includes('Takdir');
  const isTesekkur = title.includes('Teşekkür');
  const isNone = !isTakdir && !isTesekkur;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* L: Settings */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Belge Şartları</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Eğitim Seviyesi</label>
              <div className="flex gap-2">
                <button onClick={()=>setLevel('Ortaokul')} className={`flex-1 py-2 rounded-xl font-bold ${level==='Ortaokul'?'bg-amber-500 text-white':'bg-slate-100 text-slate-600'}`}>Ortaokul</button>
                <button onClick={()=>setLevel('Lise')} className={`flex-1 py-2 rounded-xl font-bold ${level==='Lise'?'bg-amber-500 text-white':'bg-slate-100 text-slate-600'}`}>Lise</button>
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <label className="text-sm font-bold text-slate-700">Dönem Ortalaması</label>
                <span className="font-bold text-amber-600">{ort}</span>
              </div>
              <input type="range" min="0" max="100" step="0.01" value={ort} onChange={e=>setOrt(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
            </div>

            {level === 'Ortaokul' && (
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Türkçe Dersi Notu (Min 70 şartı)</label>
                <NumericInput   min="0" max="100" value={turkce} onChange={e=>setTurkce(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl font-bold" />
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Özürsüz Devamsızlık (Gün)</label>
              <NumericInput   min="0" value={devamsizlik} onChange={e=>setDevamsizlik(Number(e.target.value))} className="w-full px-4 py-2 border rounded-xl font-bold" />
            </div>

            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
              <input type="checkbox" checked={fail} onChange={e=>setFail(e.target.checked)} className="w-5 h-5 accent-amber-500" />
              <span className="text-sm font-bold text-slate-700">Zayıf / Başarısız dersim var</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
              <input type="checkbox" checked={disiplin} onChange={e=>setDisiplin(e.target.checked)} className="w-5 h-5 accent-amber-500" />
              <span className="text-sm font-bold text-slate-700">Disiplin cezam var</span>
            </label>
          </div>
        </div>

        {/* R: Certificate */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[400px]">
           <div className={`w-full h-full relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-xl border-4 flex flex-col items-center text-center justify-center transition-all duration-500 ${isTakdir ? 'bg-[#FDFBF7] border-amber-300' : isTesekkur ? 'bg-[#F8FAFC] border-slate-300' : 'bg-red-50 border-red-200'}`}>
              
              <div className={`absolute top-0 left-0 w-full h-4 ${isTakdir ? 'bg-amber-400' : isTesekkur ? 'bg-slate-400' : 'bg-red-400'}`}></div>
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner mb-6 ${isTakdir ? 'bg-amber-100 text-amber-500' : isTesekkur ? 'bg-slate-200 text-slate-500' : 'bg-red-100 text-red-500'}`}>
                <Award className="w-12 h-12" />
              </div>
              
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isTakdir ? 'text-amber-600' : isTesekkur ? 'text-slate-500' : 'text-red-500'}`}>
                MEB DÖNEM SONU BELGESİ
              </h2>
              
              <div className={`text-3xl md:text-5xl font-black mb-6 ${isNone ? 'text-red-700' : 'text-slate-800'}`}>
                {title}
              </div>

              {loading && <Loader2 className="w-6 h-6 animate-spin text-slate-400" />}

              {!loading && (
                <div className="w-full max-w-sm mt-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-black/5 text-xs font-bold text-slate-600 text-left space-y-2">
                  <div className="flex justify-between"><span>Ortalama:</span> <span>{ort}</span></div>
                  <div className="flex justify-between"><span>Zayıf Ders:</span> <span className={fail?'text-red-500':'text-emerald-500'}>{fail ? 'Var' : 'Yok'}</span></div>
                  <div className="flex justify-between"><span>Devamsızlık:</span> <span className={devamsizlik>5?'text-red-500':'text-emerald-500'}>{devamsizlik} Gün</span></div>
                  <div className="flex justify-between"><span>Disiplin:</span> <span className={disiplin?'text-red-500':'text-emerald-500'}>{disiplin ? 'Cezalı' : 'Yok'}</span></div>
                </div>
              )}
           </div>
        </div>

      </div>
    
      {res?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
    </div>
  );
}

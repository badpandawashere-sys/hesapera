'use client';

import { useState, useEffect } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { GraduationCap, Loader2, Info, Plus, Minus, CheckCircle2, XCircle } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface KpssFormProps {
  calculator: CalculatorViewModel;
}

const stepperStyles = `
  .stepper-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background-color: #F1F5F9;
    color: #475569;
    font-weight: bold;
    transition: all 0.15s;
    border: 1px solid #E2E8F0;
  }
  .stepper-btn:hover:not(:disabled) {
    background-color: #E2E8F0;
    color: #1E293B;
  }
  .stepper-btn:active:not(:disabled) {
    transform: scale(0.95);
  }
  .stepper-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .exam-pattern {
    background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
    background-size: 16px 16px;
  }
`;

export function KpssForm({ calculator }: KpssFormProps) {
  const [level, setLevel] = useState<'lisans' | 'onlisans' | 'ortaogretim'>('lisans');
  const [scoreType, setScoreType] = useState<'KPSSP3' | 'KPSSP1'>('KPSSP3');
  
  const [gyCorrect, setGyCorrect] = useState(0);
  const [gyWrong, setGyWrong] = useState(0);
  
  const [gkCorrect, setGkCorrect] = useState(0);
  const [gkWrong, setGkWrong] = useState(0);

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // max questions logic
  const maxQ = level === 'lisans' ? 60 : 40;

  useEffect(() => {
    setIsMounted(true);
    handleCalculate();
  }, [level, scoreType]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-clamp when level changes max limit
  useEffect(() => {
    if (gyCorrect + gyWrong > maxQ) {
      setGyCorrect(0);
      setGyWrong(0);
    }
    if (gkCorrect + gkWrong > maxQ) {
      setGkCorrect(0);
      setGkWrong(0);
    }
  }, [maxQ]);

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        level,
        scoreType,
        gyCorrect,
        gyWrong,
        gkCorrect,
        gkWrong
      });

      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const gyTotal = gyCorrect + gyWrong;
  const gkTotal = gkCorrect + gkWrong;
  const gyError = gyTotal > maxQ;
  const gkError = gkTotal > maxQ;

  // --- Handlers for Steppers ---
  const updateVal = (setter: React.Dispatch<React.SetStateAction<number>>, current: number, delta: number, siblingVal: number) => {
    const newVal = current + delta;
    if (newVal < 0) return;
    if (newVal + siblingVal > maxQ) return;
    setter(newVal);
  };

  // --- Data Extraction ---
  const data = result?.data || {};
  const primaryStr = data.primaryResult || '0.000';
  const primaryVal = parseFloat(primaryStr.replace(',', '.')) || 0;
  
  const secondary = data.secondaryResults || {};
  
  // Safe extraction to avoid encoding bugs in keys
  const gyNetKey = Object.keys(secondary).find(k => k.includes('Yetenek') && k.includes('Net'));
  const gkNetKey = Object.keys(secondary).find(k => k.includes('Net') && !k.includes('Yetenek'));
  
  const gyNetStr = gyNetKey ? secondary[gyNetKey] : '0.00 / ' + maxQ;
  const gkNetStr = gkNetKey ? secondary[gkNetKey] : '0.00 / ' + maxQ;
  
  const notes = data.notes || [];

  const parseNetVal = (str: string) => {
    const part = str.split('/')[0];
    if (!part) return 0;
    return parseFloat(part.trim()) || 0;
  };

  const gyNetVal = parseNetVal(gyNetStr);
  const gkNetVal = parseNetVal(gkNetStr);

  const gyProgress = Math.max(0, (gyNetVal / maxQ) * 100);
  const gkProgress = Math.max(0, (gkNetVal / maxQ) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: stepperStyles }} />
      
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN - GİRDİLER */}
          <div className="lg:col-span-6 flex flex-col space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                KPSS Puan Hesaplama
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Eğitim düzeyi ve doğru/yanlış sayılarınız üzerinden tahmini KPSS puanınızı hesaplayın.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* LEVEL & SCORE TYPE */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Eğitim Düzeyi</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'lisans', label: 'Lisans' },
                      { id: 'onlisans', label: 'Önlisans' },
                      { id: 'ortaogretim', label: 'Ortaöğretim' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setLevel(item.id as any)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${level === item.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">Puan Türü</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'KPSSP3', label: 'KPSSP3 (Genel)' },
                      { id: 'KPSSP1', label: 'KPSSP1 (Teknik)' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setScoreType(item.id as any)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${scoreType === item.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GY MODULE */}
              <div className={`bg-slate-50 border p-5 rounded-2xl transition-all ${gyError ? 'border-red-300' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Genel Yetenek</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${gyError ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                    Kullanılan: {gyTotal} / {maxQ}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Correct */}
                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-emerald-600 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Doğru</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button className="stepper-btn" onClick={() => updateVal(setGyCorrect, gyCorrect, -1, gyWrong)} disabled={gyCorrect <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-xl w-8 text-center text-slate-800">{gyCorrect}</span>
                      <button className="stepper-btn" onClick={() => updateVal(setGyCorrect, gyCorrect, 1, gyWrong)} disabled={gyTotal >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Wrong */}
                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-red-500 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Yanlış</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button className="stepper-btn" onClick={() => updateVal(setGyWrong, gyWrong, -1, gyCorrect)} disabled={gyWrong <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-xl w-8 text-center text-slate-800">{gyWrong}</span>
                      <button className="stepper-btn" onClick={() => updateVal(setGyWrong, gyWrong, 1, gyCorrect)} disabled={gyTotal >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GK MODULE */}
              <div className={`bg-slate-50 border p-5 rounded-2xl transition-all ${gkError ? 'border-red-300' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Genel Kültür</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${gkError ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                    Kullanılan: {gkTotal} / {maxQ}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Correct */}
                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-emerald-600 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Doğru</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button className="stepper-btn" onClick={() => updateVal(setGkCorrect, gkCorrect, -1, gkWrong)} disabled={gkCorrect <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-xl w-8 text-center text-slate-800">{gkCorrect}</span>
                      <button className="stepper-btn" onClick={() => updateVal(setGkCorrect, gkCorrect, 1, gkWrong)} disabled={gkTotal >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Wrong */}
                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-red-500 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Yanlış</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button className="stepper-btn" onClick={() => updateVal(setGkWrong, gkWrong, -1, gkCorrect)} disabled={gkWrong <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-xl w-8 text-center text-slate-800">{gkWrong}</span>
                      <button className="stepper-btn" onClick={() => updateVal(setGkWrong, gkWrong, 1, gkCorrect)} disabled={gkTotal >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="w-full flex justify-center mt-6">
              <div className="w-full max-w-[280px]">
                <CalculatorSubmitButton 
                  onClick={handleCalculate} 
                  isLoading={isLoading} 
                  className="!h-[64px] !text-[24px] [&>img]:!h-[42px] shadow-xl hover:shadow-2xl" 
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - SCORECARD */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center h-full">
            
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col">
              
              {/* Score Header (Academic Theme) */}
              <div className="bg-indigo-950 px-6 py-10 relative overflow-hidden flex flex-col items-center text-center">
                <div className="exam-pattern absolute inset-0 opacity-40 pointer-events-none"></div>
                
                <h3 className="relative z-10 text-indigo-300 font-semibold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Tahmini KPSS Puanı
                </h3>
                
                <div className="relative z-10 text-6xl sm:text-7xl font-black text-white drop-shadow-md mb-6">
                  {isMounted ? (
                    <NumberFlow 
                      value={primaryVal}
                      format={{ style: 'decimal', minimumFractionDigits: 3, maximumFractionDigits: 3 }}
                    />
                  ) : (
                    <span>{primaryVal.toFixed(3)}</span>
                  )}
                </div>
                
                <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-900/80 border border-indigo-700/50 rounded-full">
                  <span className="text-xs font-bold text-indigo-100">{scoreType} &bull; {level === 'lisans' ? 'Lisans' : level === 'onlisans' ? 'Önlisans' : 'Ortaöğretim'}</span>
                </div>
              </div>

              {/* Performance Modules */}
              <div className="px-6 py-8 bg-slate-50 space-y-6">
                
                {/* GY */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Genel Yetenek Neti</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Maksimum Soru: {maxQ}</p>
                    </div>
                    <div className="font-black text-lg text-slate-900">{gyNetStr}</div>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${gyProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* GK */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Genel Kültür Neti</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Maksimum Soru: {maxQ}</p>
                    </div>
                    <div className="font-black text-lg text-slate-900">{gkNetStr}</div>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${gkProgress}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>

            {/* LEGAL NOTES / WARNINGS */}
            {notes && notes.length > 0 && (
              <div className="mt-6 w-full max-w-md flex items-start gap-3 bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl text-slate-600 shadow-sm">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" />
                <div className="space-y-2">
                  {(notes as string[]).map((note, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed font-medium">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}


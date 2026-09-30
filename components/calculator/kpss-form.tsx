'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorSubmitButton } from './calculator-submit-button';
import { GraduationCap, Info, Plus, Minus, CheckCircle2, XCircle } from 'lucide-react';

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
    transition: all 0.2s;
  }
  .stepper-btn:hover:not(:disabled) {
    background-color: #E2E8F0;
    color: #0F172A;
  }
  .stepper-btn:active:not(:disabled) {
    transform: scale(0.95);
  }
  .stepper-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  // max questions logic is now strictly 60 for all levels
  const maxQ = 60;

  useEffect(() => {
    setIsMounted(true);
    setResult(null);
  }, [level, scoreType]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-clamp when max limit changes (not really needed since maxQ is always 60 now, but kept for safety)
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
    if (gyCorrect + gyWrong + gkCorrect + gkWrong === 0) {
      setResult(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await calculateAction(calculator.slug, {
        level,
        scoreType, // the backend overrides this for non-lisans anyway
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

  const handleStepper = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number,
    delta: number,
    siblingVal: number
  ) => {
    const newVal = current + delta;
    if (newVal < 0) return;
    if (newVal + siblingVal > maxQ) return;
    setter(newVal);
  };

  // --- Data Extraction ---
  const data = result?.data || {};
  const primaryStr = result ? (data.primaryResult || '0.00') : null;

  const secondary = data.secondaryResults || {};

  // Safe extraction to avoid encoding bugs in keys
  const gyNetKey = Object.keys(secondary).find(k => k.includes('Yetenek') && k.includes('Net'));
  const gkNetKey = Object.keys(secondary).find(k => k.includes('Net') && !k.includes('Yetenek'));

  const gyNetStr = gyNetKey ? secondary[gyNetKey] : '0.00';
  const gkNetStr = gkNetKey ? secondary[gkNetKey] : '0.00';

  const gyNetVal = parseFloat(gyNetStr) || 0;
  const gkNetVal = parseFloat(gkNetStr) || 0;

  // For progress bars (we can limit them to 0-60 visually)
  const gyProgress = Math.max(0, Math.min(100, (gyNetVal / maxQ) * 100));
  const gkProgress = Math.max(0, Math.min(100, (gkNetVal / maxQ) * 100));

  const actualScoreType = secondary['Puan Türü'] || (level === 'lisans' ? scoreType : (level === 'onlisans' ? 'KPSSP93' : 'KPSSP94'));
  const isEligible = result ? data.isEligible : true;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: stepperStyles }} />
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Form */}
          <div className="lg:col-span-6 flex flex-col space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                KPSS Net Hesaplama
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Eğitim düzeyi ve doğru/yanlış sayılarınız üzerinden KPSS netlerinizi hesaplayın.
              </p>
            </div>

            <div className="space-y-8">

              {/* Exam Settings */}
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

                {level === 'lisans' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-bold text-slate-700">Puan Türü Seçimi</label>
                    <div className="flex flex-wrap gap-2">
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
                )}
              </div>

              {/* GY Section */}
              <div className="bg-slate-50 border p-5 rounded-2xl transition-all border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Genel Yetenek</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-200 text-slate-600">Kullanılan: {gyCorrect + gyWrong} / {maxQ}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-emerald-600 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Doğru</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGyCorrect, gyCorrect, -1, gyWrong)} disabled={gyCorrect <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-10 text-center text-slate-700">{gyCorrect}</span>
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGyCorrect, gyCorrect, 1, gyWrong)} disabled={gyCorrect + gyWrong >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-rose-500 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">Yanlış</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGyWrong, gyWrong, -1, gyCorrect)} disabled={gyWrong <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-10 text-center text-slate-700">{gyWrong}</span>
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGyWrong, gyWrong, 1, gyCorrect)} disabled={gyCorrect + gyWrong >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GK Section */}
              <div className="bg-slate-50 border p-5 rounded-2xl transition-all border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Genel Kültür</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-200 text-slate-600">Kullanılan: {gkCorrect + gkWrong} / {maxQ}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-emerald-600 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Doğru</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGkCorrect, gkCorrect, -1, gkWrong)} disabled={gkCorrect <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-10 text-center text-slate-700">{gkCorrect}</span>
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGkCorrect, gkCorrect, 1, gkWrong)} disabled={gkCorrect + gkWrong >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-rose-500 mb-2">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">Yanlış</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGkWrong, gkWrong, -1, gkCorrect)} disabled={gkWrong <= 0}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-10 text-center text-slate-700">{gkWrong}</span>
                      <button type="button" className="stepper-btn" onClick={() => handleStepper(setGkWrong, gkWrong, 1, gkCorrect)} disabled={gkCorrect + gkWrong >= maxQ}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center h-full">

            <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col">

              {/* Score Header */}
              <div className="bg-indigo-950 px-6 py-10 relative overflow-hidden flex flex-col items-center text-center">
                <div className="exam-pattern absolute inset-0 opacity-40 pointer-events-none"></div>

                <h3 className="relative z-10 text-indigo-300 font-semibold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  KPSS Net Sonucu
                </h3>

                <div className="relative z-10 text-6xl sm:text-7xl font-black text-white drop-shadow-md mb-6">
                  {primaryStr !== null ? (
                    <span data-testid="total-net-display">{primaryStr} Net</span>
                  ) : (
                    <span>—</span>
                  )}
                </div>

                {primaryStr === null ? (
                  <p className="relative z-10 text-indigo-200 text-sm font-medium mt-[-0.5rem] px-4 text-center">
                    Doğru ve yanlış sayılarını girerek netlerinizi hesaplayın.
                  </p>
                ) : (
                  <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-900/80 border border-indigo-700/50 rounded-full">
                    <span className="text-xs font-bold text-indigo-100">{actualScoreType} &bull; {level === 'lisans' ? 'Lisans' : level === 'onlisans' ? 'Önlisans' : 'Ortaöğretim'}</span>
                  </div>
                )}
              </div>

              {/* Performance Modules */}
              <div className="px-6 py-8 bg-slate-50 space-y-6" style={{ opacity: result ? 1 : 0.5, pointerEvents: result ? 'auto' : 'none' }}>

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
                      className="h-full bg-indigo-500 transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${gkProgress}%` }}
                    ></div>
                  </div>
                </div>

                {result && !isEligible && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-rose-700 animate-in fade-in">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">
                      <strong>Uyarı:</strong> ÖSYM kurallarına göre bu verilerle ilgili KPSS puanı hesaplanmaz. Her iki testten de en az 1 ham puan (net) bulunması zorunludur.
                    </p>
                  </div>
                )}

                {result && isEligible && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-700">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">
                      <strong>Bilgi:</strong> KPSS puanı yalnız doğru ve yanlış sayılarından hesaplanmaz. Türkiye geneli ortalama (X) ve standart sapma (S) değerleri ile standart puana (ASP) dönüştürülerek hesaplanır.
                    </p>
                  </div>
                )}

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
        </div>
      </div>

      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}

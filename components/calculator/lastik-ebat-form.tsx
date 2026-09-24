'use client';

import { useState, useEffect } from 'react';
import { ShareResult } from './share-result';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { calculateAction } from '@/app/actions/calculate';
import { Loader2, Calculator, ArrowRight, Gauge, Disc, Info } from 'lucide-react';
import NumberFlow from '@number-flow/react';

const formatDec = (num: number) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(num);
const formatPct = (num: number) => (num > 0 ? '+' : '') + new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + '%';

export function LastikEbatForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [oldWidthStr, setOldWidthStr] = useState<string>('205');
  const [oldWidth, setOldWidth] = useState<number>(205);
  const [oldAspectStr, setOldAspectStr] = useState<string>('55');
  const [oldAspect, setOldAspect] = useState<number>(55);
  const [oldRimStr, setOldRimStr] = useState<string>('16');
  const [oldRim, setOldRim] = useState<number>(16);

  const [newWidthStr, setNewWidthStr] = useState<string>('225');
  const [newWidth, setNewWidth] = useState<number>(225);
  const [newAspectStr, setNewAspectStr] = useState<string>('45');
  const [newAspect, setNewAspect] = useState<number>(45);
  const [newRimStr, setNewRimStr] = useState<string>('17');
  const [newRim, setNewRim] = useState<number>(17);

  const [speedStr, setSpeedStr] = useState<string>('100');
  const [speed, setSpeed] = useState<number>(100);

  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const parseFormattedStr = (str: string): number | null => {
    if (!str) return null;
    const normalized = str.replace(/\./g, '').replace(/,/g, '.');
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  };

  const parseIntegerStr = (str: string): number | null => {
    if (!str) return null;
    const normalized = str.replace(/[^0-9]/g, '');
    const n = parseInt(normalized, 10);
    return isNaN(n) ? null : n;
  };

  const makeDecimalHandler = (setStr: (s: string) => void, setVal: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.includes('-')) return;

    val = val.replace(/[^0-9,]/g, '');
    setStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && parsed >= 0) {
      setVal(parsed);
    }
  };

  const makeIntegerHandler = (setStr: (s: string) => void, setVal: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.includes('-')) return;

    val = val.replace(/[^0-9]/g, '');
    setStr(val);
    const parsed = parseIntegerStr(val);
    if (parsed !== null && parsed >= 0) {
      setVal(parsed);
    }
  };

  const handleBlur = (val: number, setStr: (s: string) => void, isDecimal: boolean) => () => {
    if (isDecimal) {
      setStr(val.toString().replace('.', ','));
    } else {
      setStr(val.toString());
    }
  };

  const doCalculate = async () => {
    setLoading(true);
    try {
      const response = await calculateAction(calculator.slug, {
        oldTire: { width: oldWidth, aspectRatio: oldAspect, rimInch: oldRim },
        newTire: { width: newWidth, aspectRatio: newAspect, rimInch: newRim },
        indicatedSpeed: speed
      });
      setRes(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setMounted(true); doCalculate(); }, []);
  useEffect(() => { if (mounted) { const t = setTimeout(doCalculate, 400); return () => clearTimeout(t); } }, [oldWidth, oldAspect, oldRim, newWidth, newAspect, newRim, speed]);

  const primary = res?.data?.primaryResult;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-0">
      <div className="w-full lg:flex-1 space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-slate-200/60 flex flex-col gap-8 md:gap-10 transition-all hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] relative overflow-hidden">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Disc className="w-5 h-5 text-indigo-500" /> Mevcut Lastik
            </h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 md:p-6 bg-slate-50/50 rounded-[20px] border border-slate-100/80">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-500">Genişlik (mm)</label>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  value={oldWidthStr} 
                  onChange={makeIntegerHandler(setOldWidthStr, setOldWidth)} 
                  onBlur={handleBlur(oldWidth, setOldWidthStr, false)}
                  className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none" 
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-[-16px] md:left-[-24px] top-9 text-2xl md:text-3xl font-light text-slate-300">/</div>
                <label className="text-sm font-medium text-slate-500 pl-2">Yanak (%)</label>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  value={oldAspectStr} 
                  onChange={makeIntegerHandler(setOldAspectStr, setOldAspect)} 
                  onBlur={handleBlur(oldAspect, setOldAspectStr, false)}
                  className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none pl-2" 
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-[-12px] md:left-[-16px] top-9 text-2xl md:text-3xl font-light text-slate-300">R</div>
                <label className="text-sm font-medium text-slate-500 pl-4">Jant (inç)</label>
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={oldRimStr} 
                  onChange={makeDecimalHandler(setOldRimStr, setOldRim)} 
                  onBlur={handleBlur(oldRim, setOldRimStr, true)}
                  className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none pl-4" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Disc className="w-5 h-5 text-indigo-500" /> Yeni Lastik
            </h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 md:p-6 bg-slate-50/50 rounded-[20px] border border-slate-100/80">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-500">Genişlik (mm)</label>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  value={newWidthStr} 
                  onChange={makeIntegerHandler(setNewWidthStr, setNewWidth)} 
                  onBlur={handleBlur(newWidth, setNewWidthStr, false)}
                  className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none" 
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-[-16px] md:left-[-24px] top-9 text-2xl md:text-3xl font-light text-slate-300">/</div>
                <label className="text-sm font-medium text-slate-500 pl-2">Yanak (%)</label>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  value={newAspectStr} 
                  onChange={makeIntegerHandler(setNewAspectStr, setNewAspect)} 
                  onBlur={handleBlur(newAspect, setNewAspectStr, false)}
                  className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none pl-2" 
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-[-12px] md:left-[-16px] top-9 text-2xl md:text-3xl font-light text-slate-300">R</div>
                <label className="text-sm font-medium text-slate-500 pl-4">Jant (inç)</label>
                <input 
                  type="text" 
                  inputMode="decimal" 
                  value={newRimStr} 
                  onChange={makeDecimalHandler(setNewRimStr, setNewRim)} 
                  onBlur={handleBlur(newRim, setNewRimStr, true)}
                  className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none pl-4" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-indigo-500" /> Gösterge Hızı (km/s)
            </h3>
            <div className="p-4 md:p-6 bg-slate-50/50 rounded-[20px] border border-slate-100/80">
              <input 
                type="text" 
                inputMode="decimal" 
                value={speedStr} 
                onChange={makeDecimalHandler(setSpeedStr, setSpeed)} 
                onBlur={handleBlur(speed, setSpeedStr, true)}
                className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent outline-none" 
              />
            </div>
          </div>

        </div>
      </div>

      <div className="w-full lg:w-[400px] shrink-0 space-y-6">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          {loading && !primary && (
            <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-indigo-200/80 font-medium tracking-wide uppercase text-sm mb-3">Çap Farkı</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[40px] sm:text-[48px] md:text-[56px] font-black tracking-tight leading-none">
                  {primary ? <NumberFlow value={primary.diameterDifferencePercent} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /> : '0,00'}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-indigo-300">%</span>
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div className="space-y-4">
              <p className="text-indigo-200/80 font-medium tracking-wide text-sm mb-2">Hız Karşılaştırması</p>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-white/70">Gösterge Hızı</span>
                <span className="text-white">{primary ? formatDec(speed) : '0'} km/s</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-white/70">Gerçek Hız</span>
                <span className="text-indigo-300 font-bold text-base">≈ {primary ? <NumberFlow value={primary.actualSpeed} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /> : '0'} km/s</span>
              </div>
            </div>

            {primary && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  {primary.diameterDifferencePercent > 0 
                    ? `Yeni lastik daha büyük olduğu için, ${speed} km/s hızla giderken gerçekte daha hızlı (~${formatDec(primary.actualSpeed)} km/s) gidiyor olursunuz.`
                    : primary.diameterDifferencePercent < 0 
                    ? `Yeni lastik daha küçük olduğu için, ${speed} km/s hızla giderken gerçekte daha yavaş (~${formatDec(primary.actualSpeed)} km/s) gidiyor olursunuz.`
                    : `Lastik çapları aynı olduğu için hız göstergesinde sapma olmayacaktır.`}
                </p>
              </div>
            )}
            
            {res && res.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={res.data} />}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Detaylı Karşılaştırma</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80">
                <tr>
                  <th className="px-3 py-3 rounded-l-xl font-semibold">Özellik</th>
                  <th className="px-3 py-3 font-semibold">Mevcut</th>
                  <th className="px-3 py-3 rounded-r-xl font-semibold">Yeni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-4 font-medium text-slate-700">Yanak Yük.</td>
                  <td className="px-3 py-4 text-slate-600">{primary ? formatDec(primary.oldTireCalc.sidewallHeight) : 0} mm</td>
                  <td className="px-3 py-4 font-medium text-slate-900">{primary ? formatDec(primary.newTireCalc.sidewallHeight) : 0} mm</td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-medium text-slate-700">Toplam Çap</td>
                  <td className="px-3 py-4 text-slate-600">{primary ? formatDec(primary.oldTireCalc.overallDiameter) : 0} mm</td>
                  <td className="px-3 py-4 font-medium text-slate-900">{primary ? formatDec(primary.newTireCalc.overallDiameter) : 0} mm</td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-medium text-slate-700">Çevre</td>
                  <td className="px-3 py-4 text-slate-600">{primary ? formatDec(primary.oldTireCalc.circumference) : 0} mm</td>
                  <td className="px-3 py-4 font-medium text-slate-900">{primary ? formatDec(primary.newTireCalc.circumference) : 0} mm</td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-medium text-slate-700">Dönüş/km</td>
                  <td className="px-3 py-4 text-slate-600">{primary ? formatDec(primary.oldTireCalc.revolutionsPerKm) : 0} tur</td>
                  <td className="px-3 py-4 font-medium text-slate-900">{primary ? formatDec(primary.newTireCalc.revolutionsPerKm) : 0} tur</td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-medium text-slate-700">Araç Yüks.</td>
                  <td className="px-3 py-4 text-slate-600">-</td>
                  <td className="px-3 py-4 font-medium text-slate-900">{(primary && primary.rideHeightDifference > 0) ? '+' : ''}{primary ? formatDec(primary.rideHeightDifference) : 0} mm</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100/80 flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-900/80 leading-relaxed font-medium">
              Çap farkı arttıkça hız göstergesi, sürüş yüksekliği ve araç sistemlerinin hesapları etkilenebilir. Belirtilen sonuçlar yalnızca geometrik değerlerdir, aracınızla uyumluluğu üretici onayı ile ayrıca kontrol edilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

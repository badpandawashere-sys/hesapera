'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gauge, Route, Wallet } from 'lucide-react';
import { AdBanner } from '@/components/ads/ad-banner';
import { CalculatorBreakdownCard, CalculatorInfoCard } from '@/components/calculator/calculator-result';
import { CalculatorFieldComponent } from '@/components/calculator/calculator-field';
import {
  PremiumCalculatorResultPanel,
  PremiumCalculatorShell,
  PremiumCalculatorSubmit,
} from '@/components/calculator/premium-calculator';
import { calculateAction } from '@/app/actions/calculate';
import type { CalculatorViewModel } from '@/calculators/core/calculator-types';
import type { CalculatorResultData } from '@/calculators/core/calculator-result';
import type { YakitTuketimiMod } from '@/calculators/formulas/yakitTuketimi';

type Mod = YakitTuketimiMod;
type ResultData = CalculatorResultData<string, Record<string, string>>;

const MODS: { id: Mod; icon: React.ElementType; label: string; sub: string }[] = [
  { id: 'A', icon: Gauge,  label: 'Ne kadar yaktım?',          sub: 'Tutar + mesafe' },
  { id: 'B', icon: Route,  label: 'Bu bütçeyle kaç km giderim?', sub: 'Bütçe + TL/km' },
  { id: 'C', icon: Wallet, label: 'Bu mesafe kaça mal olur?',   sub: 'Mesafe + TL/km' },
];

function ModSelector({ active, onChange }: { active: Mod; onChange: (m: Mod) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">
        Hesaplama Türü
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODS.map(({ id, icon: Icon, label, sub }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={isActive}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2
                ${isActive
                  ? 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-600/30 shadow-[var(--shadow-level-1)] ring-1 ring-violet-600/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
            >
              <div className="flex items-center gap-2.5 mb-2 w-full">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-violet-600/10' : 'bg-slate-100'}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-500'}`} />
                </div>
                {isActive && (
                  <div className="shrink-0 w-2 h-2 rounded-full bg-violet-600 ml-auto" />
                )}
              </div>
              <span className={`text-sm font-bold leading-tight mb-1 ${isActive ? 'text-violet-600' : 'text-slate-700'}`}>
                {label}
              </span>
              <p className="text-xs text-slate-500 leading-snug">{sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DarkResultHero({ result }: { result: ResultData }) {
  const secondaryEntries = Object.entries(result.secondaryResults ?? {});

  return (
    <PremiumCalculatorResultPanel>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <Gauge className="w-5 h-5 text-violet-300" />
          </div>
          <span className="text-violet-300 font-semibold tracking-wide uppercase text-sm">Hesaplama Sonucu</span>
        </div>

        <div className="space-y-8 flex-1">
          <div>
            <h3 className="text-slate-400 font-medium mb-3">{result.primaryLabel}</h3>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {result.primaryResult}
            </div>
          </div>

          {secondaryEntries.length > 0 && (
            <div className="pt-8 border-t border-white/10 space-y-5">
              {secondaryEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between items-baseline gap-4">
                  <span className="text-slate-400 text-sm font-medium">{key}</span>
                  <span className="text-lg font-bold text-white text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PremiumCalculatorResultPanel>
  );
}

function EmptyResultHero() {
  return (
    <PremiumCalculatorResultPanel state="empty">
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center flex-1">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner backdrop-blur-sm">
          <Gauge className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Henüz hesaplama yapılmadı</h3>
        <p className="text-slate-400 max-w-[250px] leading-relaxed">
          Gerekli alanları doldurun ve Hesapla&apos;ya tıklayın.
        </p>
      </div>
    </PremiumCalculatorResultPanel>
  );
}

export function YakitTuketimiForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [mod, setMod] = useState<Mod>('A');
  const [inputValues, setInputValues] = useState<Record<string, number | ''>>({});
  const [showFuelPrice, setShowFuelPrice] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const requestVersion = useRef(0);

  const invalidateResult = () => {
    requestVersion.current += 1;
    setResult(null);
    setErrors({});
    setIsLoading(false);
  };

  const handleModChange = (newMod: Mod) => {
    invalidateResult();
    setMod(newMod);
    setInputValues({});
    setShowFuelPrice(false);
  };

  const handleReset = () => {
    invalidateResult();
    setInputValues({});
    setShowFuelPrice(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const version = ++requestVersion.current;
    setIsLoading(true);
    setResult(null);
    setErrors({});

    const input: Record<string, number | string> = { mod };

    const activeFieldIds = mod === 'A'
      ? (showFuelPrice ? ['paidAmount', 'distance', 'fuelPrice'] : ['paidAmount', 'distance'])
      : mod === 'B' ? ['budget', 'costPerKm']
      : ['distance', 'costPerKm'];

    for (const fieldId of activeFieldIds) {
      const value = inputValues[fieldId];
      if (value !== undefined && value !== '') input[fieldId] = value;
    }

    try {
      const response = await calculateAction(calculator.slug, input);
      if (version !== requestVersion.current) return;
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        const fieldErrors: Record<string, string> = {};
        const generalErrors: string[] = [];
        for (const error of response.errors ?? ['Hesaplama yapılamadı.']) {
          const separator = error.indexOf(':');
          const fieldId = error.slice(0, separator);
          if (separator > 0 && activeFieldIds.includes(fieldId)) {
            fieldErrors[fieldId] = error.slice(separator + 1).trim();
          } else {
            generalErrors.push(error);
          }
        }
        if (generalErrors.length) fieldErrors.general = generalErrors.join(' ');
        setErrors(fieldErrors);
      }
    } catch {
      if (version === requestVersion.current) {
        setErrors({ general: 'Hesaplama sırasında bir bağlantı hatası oluştu. Lütfen tekrar deneyin.' });
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  };

  const headings: Record<Mod, { title: string; sub: string }> = {
    A: { title: 'Km\'de Ne Kadar Yaktım?', sub: 'Ödediğiniz yakıt tutarı ve gittiğiniz mesafeyi girin.' },
    B: { title: 'Bu Bütçeyle Kaç Km Giderim?', sub: 'Bütçenizi ve km başına maliyetinizi girin.' },
    C: { title: 'Bu Mesafe Kaça Mal Olur?', sub: 'Gidilecek mesafeyi ve km başına maliyetinizi girin.' },
  };

  const getField = (id: string) => calculator.fields.find(f => f.id === id)!;

  const renderField = (id: string, overrideLabel?: string) => {
    const fieldDef = getField(id);
    const field = overrideLabel ? { ...fieldDef, label: overrideLabel } : fieldDef;
    return (
      <div className="flex-1 min-w-[200px]" key={field.id}>
        <CalculatorFieldComponent
          field={field}
          value={inputValues[field.id] ?? ''}
          onChange={(value: number | '') => {
            invalidateResult();
            setInputValues(prev => ({ ...prev, [field.id]: value }));
          }}
          error={errors[field.id]}
        />
      </div>
    );
  };

  return (
    <PremiumCalculatorShell
      isLoading={isLoading}
      form={
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">

              <ModSelector active={mod} onChange={handleModChange} />

              <div className="pt-2 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 mt-4">{headings[mod].title}</h2>
                <p className="text-slate-500 mb-6">{headings[mod].sub}</p>

                {/* OVERRIDE CLASS: Making CalculatorFieldComponent inputs look premium */}
                <div className="space-y-6 [&_input]:h-14 [&_input]:text-lg [&_input]:rounded-2xl [&_input]:bg-background [&_input]:border-slate-200 [&_input]:font-bold [&_input]:text-slate-800 [&_input]:focus:border-violet-600 [&_input]:focus:ring-2 [&_input]:focus:ring-violet-600/20 [&_input]:transition-all [&_input]:motion-reduce:transition-none [&_label]:text-sm [&_label]:font-semibold [&_label]:text-slate-700">

                  {mod === 'A' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {renderField('paidAmount', 'Ödenen Yakıt Tutarı (TL)')}
                        {renderField('distance', 'Gidilen Mesafe (km)')}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <label className="flex items-center gap-4 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showFuelPrice}
                            onChange={() => {
                              invalidateResult();
                              setShowFuelPrice(!showFuelPrice);
                              if (showFuelPrice) {
                                setInputValues(prev => ({ ...prev, fuelPrice: '' }));
                              }
                            }}
                          />
                          <div
                            aria-hidden="true"
                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-violet-600 peer-focus-visible:ring-offset-2 shrink-0 ${showFuelPrice ? 'bg-violet-600' : 'bg-slate-200'}`}
                          >
                            <span
                              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${showFuelPrice ? 'translate-x-[22px]' : 'translate-x-1'}`}
                            />
                          </div>
                          <span className="text-[15px] font-semibold text-slate-700">
                            Yakıt litre fiyatını da biliyorum
                          </span>
                        </label>

                        {showFuelPrice && (
                          <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-200 pt-5 border-t border-slate-100">
                            <div className="max-w-[50%] min-w-[200px]">
                              {renderField('fuelPrice', 'Yakıt Litre Fiyatı (TL/L)')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {mod === 'B' && (
                    <div className="flex flex-col sm:flex-row gap-6">
                      {renderField('budget', 'Toplam Bütçe (TL)')}
                      {renderField('costPerKm', 'Km Başına Maliyet (TL/km)')}
                    </div>
                  )}

                  {mod === 'C' && (
                    <div className="flex flex-col sm:flex-row gap-6">
                      {renderField('distance', 'Gidilecek Mesafe (km)')}
                      {renderField('costPerKm', 'Km Başına Maliyet (TL/km)')}
                    </div>
                  )}
                </div>
              </div>

              {errors.general && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 font-medium flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  {errors.general}
                </div>
              )}

              <PremiumCalculatorSubmit
                type="submit"
                isLoading={isLoading}
                containerClassName="pt-6 border-t border-slate-100"
                footer={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[56px] rounded-full px-8 text-[16px] font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    onClick={handleReset}
                  >
                    Temizle
                  </Button>
                }
              />
        </form>
      }
      result={result ? <DarkResultHero result={result} /> : <EmptyResultHero />}
    >
      <AdBanner placement="calculator-after-result" />

      {result && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none">
          {result.breakdown && (
            <CalculatorBreakdownCard
              result={{
                success: true,
                data: {
                  breakdown: result.breakdown,
                  primaryResult: result.primaryResult,
                  secondaryResults: result.secondaryResults,
                },
              }}
            />
          )}
          {result.infoReference && (
            <CalculatorInfoCard
              result={{
                success: true,
                data: {
                  infoReference: result.infoReference,
                  primaryResult: result.primaryResult,
                  secondaryResults: result.secondaryResults,
                },
              }}
            />
          )}
        </div>
      )}

    </PremiumCalculatorShell>
  );
}

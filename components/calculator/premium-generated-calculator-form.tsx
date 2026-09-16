'use client';

import { useState } from 'react';
import { CalculatorFieldComponent } from './calculator-field';
import {
  PremiumCalculatorResultPanel,
  PremiumCalculatorShell,
  PremiumCalculatorSubmit,
} from './premium-calculator';
import { Button } from '@/components/ui/button';
import { calculateAction } from '@/app/actions/calculate';
import type { CalculatorResult } from '@/calculators/core/calculator-result';
import type { CalculatorViewModel } from '@/calculators/core/calculator-types';

interface PremiumGeneratedCalculatorFormProps {
  calculator: CalculatorViewModel;
}

export function PremiumGeneratedCalculatorForm({ calculator }: PremiumGeneratedCalculatorFormProps) {
  const [inputValues, setInputValues] = useState<Record<string, number | ''>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setInputValues({});
    setFieldErrors({});
    setResult(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setFieldErrors({});
    setResult(null);

    try {
      const response = await calculateAction(calculator.slug, inputValues);
      if (response.success) {
        setResult(response);
        return;
      }

      const nextFieldErrors: Record<string, string> = {};
      const generalErrors: string[] = [];
      for (const error of response.errors ?? []) {
        const separator = error.indexOf(':');
        const fieldId = error.slice(0, separator);
        if (separator > 0 && calculator.fields.some(field => field.id === fieldId)) {
          nextFieldErrors[fieldId] = error.slice(separator + 1).trim();
        } else {
          generalErrors.push(error);
        }
      }
      setFieldErrors(nextFieldErrors);
      if (generalErrors.length > 0) setResult({ success: false, errors: generalErrors });
    } catch {
      setResult({ success: false, errors: ['Hesaplama sırasında bir bağlantı hatası oluştu.'] });
    } finally {
      setIsLoading(false);
    }
  };

  const data = result?.success ? result.data : undefined;

  return (
    <PremiumCalculatorShell
      isLoading={isLoading}
      form={
        <form onSubmit={submit} noValidate className="flex flex-col gap-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hesaplama Bilgileri</h2>
            <p className="text-slate-500">Sonucu görmek için gerekli değerleri girin.</p>
          </div>

          <div className="space-y-6 [&_input]:h-14 [&_input]:text-lg [&_input]:rounded-2xl [&_input]:bg-background [&_input]:font-bold">
            {calculator.fields.map(field => (
              <CalculatorFieldComponent
                key={field.id}
                field={field}
                value={inputValues[field.id] ?? ''}
                error={fieldErrors[field.id]}
                onChange={(value: number | '') => {
                  setInputValues(previous => ({ ...previous, [field.id]: value }));
                  setFieldErrors(previous => {
                    const next = { ...previous };
                    delete next[field.id];
                    return next;
                  });
                  setResult(null);
                }}
              />
            ))}
          </div>

          {result && !result.success && result.errors && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 font-medium">
              {result.errors.join(' ')}
            </div>
          )}

          <PremiumCalculatorSubmit
            type="submit"
            isLoading={isLoading}
            containerClassName="pt-6 border-t border-slate-100"
            footer={
              <Button type="button" variant="outline" className="h-[56px] rounded-full px-8 text-base font-semibold" onClick={reset}>
                Temizle
              </Button>
            }
          />
        </form>
      }
      result={
        <PremiumCalculatorResultPanel state={data ? 'populated' : 'empty'}>
          {data ? (
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-violet-300 font-semibold tracking-wide uppercase text-sm mb-8">Hesaplama Sonucu</p>
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {String(data.primaryResult)}
              </div>
              {data.secondaryResults && (
                <div className="pt-8 mt-8 border-t border-white/10 space-y-5">
                  {Object.entries(data.secondaryResults).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-baseline gap-4">
                      <span className="text-slate-400 text-sm font-medium">{label}</span>
                      <span className="text-lg font-bold text-white text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[320px] text-center">
              <h3 className="text-xl font-bold text-slate-200 mb-2">Henüz hesaplama yapılmadı</h3>
              <p className="text-slate-400 max-w-[250px] leading-relaxed">
                Gerekli alanları doldurun ve Hesapla&apos;ya tıklayın.
              </p>
            </div>
          )}
        </PremiumCalculatorResultPanel>
      }
    />
  );
}

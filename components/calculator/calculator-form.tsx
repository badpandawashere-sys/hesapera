'use client';
import { ShareResult } from './share-result';

import { useState } from 'react';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { calculateAction } from '@/app/actions/calculate';
import { CalculatorFieldComponent } from './calculator-field';
import { 
  CalculatorMainResultCard, 
  CalculatorCategoryCard, 
  CalculatorBreakdownCard, 
  CalculatorTableCard, 
  CalculatorInfoCard 
} from './calculator-result';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AdBanner } from '@/components/ads/ad-banner';

interface CalculatorFormProps {
  calculator: CalculatorViewModel;
}

export function CalculatorForm({ calculator }: CalculatorFormProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    calculator.fields.forEach(f => {
      if (f.defaultValue !== undefined) {
        initial[f.id] = f.defaultValue;
      }
    });
    return initial;
  });

  const [result, setResult] = useState<CalculatorResult<any, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Field specific validation errors extracted from the standardized error messages
  // (e.g. "baseValue: Expected number, received string")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (id: string, value: any) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});
    
    try {
      const res = await calculateAction(calculator.slug, inputValues);
      
      if (!res.success && res.errors) {
        // Parse standard Zod error format from our engine "field.path: message"
        const newFieldErrors: Record<string, string> = {};
        const generalErrors: string[] = [];
        
        res.errors.forEach(err => {
          const colonIdx = err.indexOf(':');
          if (colonIdx > -1) {
            const fieldPath = err.substring(0, colonIdx).trim();
            const message = err.substring(colonIdx + 1).trim();
            // If the field path matches one of our field IDs
            if (calculator.fields.some(f => f.id === fieldPath)) {
              newFieldErrors[fieldPath] = message;
            } else {
              generalErrors.push(err);
            }
          } else {
            generalErrors.push(err);
          }
        });
        
        setFieldErrors(newFieldErrors);
        
        if (generalErrors.length > 0) {
          setResult({
            success: false,
            errors: generalErrors
          });
        } else {
          // If all errors were mapped to fields, don't show the global error box
          setResult(null);
        }
      } else {
        setResult(res);
      }
    } catch (err) {
      setResult({
        success: false,
        errors: ['Hesaplama sırasında beklenmeyen bir ağ hatası oluştu.']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFieldVisible = (field: import('@/calculators/core/calculator-types').CalculatorField, values: Record<string, any>) => {
    if (!field.conditions || field.conditions.length === 0) return true;
    return field.conditions.every(cond => {
      const val = values[cond.fieldId];
      if (cond.operator === 'equals') return val === cond.value;
      if (cond.operator === 'notEquals') return val !== cond.value;
      if (cond.operator === 'in' && Array.isArray(cond.value)) return cond.value.includes(val);
      return true;
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* --- ANA HESAPLAMA ALANI (FORM + MAIN RESULT) --- */}
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* SOL: FORM */}
        <div className="flex flex-col">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-[24px] bg-[var(--color-glass-bg)] backdrop-blur-[18px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-standard)] flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Hesaplama Bilgileri</h2>
            <div className="space-y-5">
              {calculator.fields.filter(f => isFieldVisible(f, inputValues)).map(field => (
                <CalculatorFieldComponent
                  key={field.id}
                  field={field}
                  value={inputValues[field.id]}
                  onChange={(val) => handleFieldChange(field.id, val)}
                  error={fieldErrors[field.id]}
                />
              ))}
            </div>
            
            <div className="mt-8 space-y-3 pt-6 border-t border-border">
              <Button 
                type="submit" 
                className="w-full h-[56px] rounded-full flex items-center justify-center gap-[10px] transition-all duration-300 bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#0EA5E9] shadow-[0_12px_32px_-8px_rgba(124,58,237,0.6),inset_0_2px_1px_rgba(255,255,255,0.4),inset_0_-2px_2px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.7),inset_0_2px_1px_rgba(255,255,255,0.5),inset_0_-2px_2px_rgba(0,0,0,0.15)] hover:brightness-105 active:scale-[0.98] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 disabled:from-slate-200 disabled:to-slate-200 disabled:shadow-none disabled:text-slate-500 text-white text-[22px] font-bold tracking-tight border-0 group relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[45%] before:rounded-t-full before:bg-gradient-to-b before:from-white/20 before:to-transparent" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-[32px] w-[32px] animate-spin text-slate-500 relative z-10" />
                ) : (
                  <img src="/hesapera_h_logo_transparent_cropped.png" alt="Hesapera" className="h-[36px] w-auto object-contain group-disabled:opacity-50 group-disabled:grayscale drop-shadow-md relative z-10" />
                )}
                <span className="relative z-10">Hesapla</span>
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full text-base font-medium h-12 rounded-xl" onClick={() => {
                const initial: Record<string, any> = {};
                calculator.fields.forEach(f => {
                  if (f.defaultValue !== undefined) {
                    initial[f.id] = f.defaultValue;
                  }
                });
                setInputValues(initial);
                setResult(null);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Temizle
              </Button>
            </div>
          </form>
        </div>

        {/* SAĞ: MAIN RESULT */}
        <div className="flex flex-col">
          {result ? (
            <CalculatorMainResultCard result={result} calculatorName={calculator.name} />
          ) : (
            <div className="rounded-[24px] bg-[var(--color-glass-bg-strong)] backdrop-blur-[24px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-elevated)] overflow-hidden flex flex-col">
              <div className="border-b border-border bg-white/40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7C3AED]"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                  <h3 className="font-semibold text-slate-800">Hesaplama Sonucu</h3>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-8 py-16 bg-white/20">
                <div className="w-16 h-16 rounded-2xl bg-white/60 border border-white flex items-center justify-center mb-5 text-slate-400 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                </div>
                <p className="text-[17px] font-semibold text-slate-800">Henüz hesaplama yapılmadı</p>
                <p className="text-[15px] text-slate-500 mt-2 max-w-xs leading-relaxed">
                  Sonucu görmek için formu doldurun ve Hesapla butonuna tıklayın.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- BANNER: FORM+RESULT İLE DETAYLAR ARASI --- */}
      <AdBanner placement="calculator-after-result" />

      {/* --- DETAIL & CONTENT AREAS (AŞAĞI BÖLÜM) --- */}
      {result && result.success && result.data && (
        <div className="space-y-6 md:space-y-8 mt-2">
          
          {/* DETAYLI BİLGİLER & KATEGORİ — akıllı grid */}
          {(result.data.breakdown || result.data.categoryIndicator) && (() => {
            const hasBreakdown = !!result.data.breakdown;
            const hasCategory = !!result.data.categoryIndicator;
            // Her iki bölüm varsa yan yana; sadece biri varsa tam genişlik
            if (hasBreakdown && hasCategory) {
              return (
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
                  <CalculatorBreakdownCard result={result} />
                  <CalculatorCategoryCard result={result} />
                </div>
              );
            }
            return (
              <div>
                {hasBreakdown && <CalculatorBreakdownCard result={result} />}
                {hasCategory && <CalculatorCategoryCard result={result} />}
              </div>
            );
          })()}

          {/* TABLO */}
          {result.data.table && (
            <div className="w-full overflow-hidden">
              <CalculatorTableCard result={result} />
            </div>
          )}

          {/* INFO REFERENCE (NASIL HESAPLANIR) */}
          {result.data.infoReference && (
            <div className="w-full">
              <CalculatorInfoCard result={result} />
            </div>
          )}
        </div>
      )}
    
      {result?.data && <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />}
    </div>
  );
}

import { CalculatorResult } from '@/calculators/core/calculator-result';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info, Calculator, CheckCircle2 } from 'lucide-react';

interface CalculatorResultProps {
  result: CalculatorResult<any, any>;
  calculatorName?: string;
}

export function CalculatorMainResultCard({ result, calculatorName }: CalculatorResultProps) {
  if (!result.success && result.errors) {
    return (
      <div className="bg-card rounded-2xl border border-destructive/50 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Hesaplama Sonucu</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-3 text-destructive bg-destructive/10 p-4 rounded-xl">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium leading-none">Hesaplama Hatası</h4>
              <ul className="text-sm list-disc list-inside mt-2">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result.data) return null;

  const { primaryResult, secondaryResults, categoryIndicator, primaryLabel: customLabel } = result.data as any;
  const { warnings, notes } = result;
  const primaryLabel = customLabel || (calculatorName ? calculatorName.replace(/ Hesaplama$/i, '') : 'Sonuç');

  return (
    <div className="rounded-[24px] bg-[var(--color-glass-bg-strong)] backdrop-blur-[24px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-elevated)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="border-b border-border bg-white/40 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#7C3AED]" />
          <h3 className="font-semibold text-slate-800">Hesaplama Sonucu</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hesaplama tamamlandı</span>
          <span className="sm:hidden">Tamamlandı</span>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        {/* Main Result Area */}
        <div className="bg-gradient-to-br from-[#F5F3FF]/80 to-[#EFF6FF]/80 border border-white/60 rounded-[20px] p-5 md:p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-sm font-semibold text-[#7C3AED] mb-1.5 relative z-10">{primaryLabel}</p>
          <div className="flex items-end justify-between relative z-10">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {typeof primaryResult === 'number' 
                ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(primaryResult) 
                : primaryResult}
            </div>
            {categoryIndicator?.statusMessage && (
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap mb-1 ${
                categoryIndicator.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                categoryIndicator.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                categoryIndicator.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                categoryIndicator.statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {categoryIndicator.ranges?.find((r: any) => 
                  (r.min === undefined || categoryIndicator.currentValue >= r.min) &&
                  (r.max === undefined || categoryIndicator.currentValue < r.max)
                )?.label || categoryIndicator.statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Results — auto-grid based on count */}
        {secondaryResults && Object.keys(secondaryResults).length > 0 && (() => {
          const entries = Object.entries(secondaryResults);
          const count = entries.length;
          const cols = count === 1 ? 'grid-cols-1' :
                       count === 2 ? 'grid-cols-2' :
                       count === 3 ? 'grid-cols-3' :
                       count <= 6 ? 'sm:grid-cols-2 lg:grid-cols-3' :
                       'sm:grid-cols-2 lg:grid-cols-3';
          return (
            <div className={`grid ${cols} gap-3`}>
              {entries.map(([key, value]) => (
                <div key={key} className="bg-muted/30 p-3 rounded-xl border border-border/50">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 truncate" title={key.replace(/([A-Z])/g, ' $1').trim()}>{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm md:text-base font-bold text-foreground truncate">{value as React.ReactNode}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Info Box */}
        <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3 flex gap-2 text-xs md:text-sm">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-blue-800/80 leading-relaxed">Sonuçlar girilen bilgilere göre hesaplanmıştır. Kesin veriler için ilgili resmi kaynağı kontrol edin.</p>
        </div>

        {/* Warnings & Notes inside main card if compact */}
        {warnings && warnings.length > 0 && (
          <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200/50 flex gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <ul className="space-y-1">
              {warnings.map((w: any, i: number) => <li key={i}>{w.message || w}</li>)}
            </ul>
          </div>
        )}

        {notes && notes.length > 0 && (
          <div className="bg-muted/50 p-3 rounded-xl border border-border flex gap-2 text-xs">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <ul className="space-y-1 text-muted-foreground">
              {notes.map((n: string, i: number) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalculatorCategoryCard({ result }: CalculatorResultProps) {
  if (!result.success || !result.data || !result.data.categoryIndicator) return null;
  const { categoryIndicator } = result.data as any;
  if (!categoryIndicator.ranges || categoryIndicator.ranges.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 md:p-6 space-y-6 h-full animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Kategori Dağılımı</h3>
        {categoryIndicator.statusMessage && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            categoryIndicator.statusColor === 'green' ? 'bg-green-50 text-green-700 border border-green-100' :
            categoryIndicator.statusColor === 'blue' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
            categoryIndicator.statusColor === 'yellow' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
            categoryIndicator.statusColor === 'orange' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
            'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {categoryIndicator.statusMessage}
          </div>
        )}
      </div>
      
      <div className="space-y-4 pt-2">
        {/* Segmented Bar */}
        <div className="h-4 w-full rounded-full flex overflow-hidden shadow-inner relative">
          {categoryIndicator.ranges.map((range: any, idx: number) => {
            const colorClass = 
              range.color === 'blue' ? 'bg-blue-400' :
              range.color === 'green' ? 'bg-green-400' :
              range.color === 'yellow' ? 'bg-yellow-400' :
              range.color === 'orange' ? 'bg-orange-400' :
              range.color === 'dark-red' ? 'bg-rose-600' : 'bg-red-500';
            return (
              <div key={idx} className={`h-full ${colorClass}`} style={{ flex: 1, borderRight: idx < categoryIndicator.ranges.length - 1 ? '2px solid white' : 'none' }}></div>
            );
          })}
        </div>
        
        {/* Labels Map */}
        <div className="grid gap-2 pt-2">
          {categoryIndicator.ranges.map((range: any, idx: number) => {
            const isCurrent = (range.min === undefined || categoryIndicator.currentValue >= range.min) &&
                              (range.max === undefined || categoryIndicator.currentValue < range.max);
            const dotColor = 
              range.color === 'blue' ? 'bg-blue-500' :
              range.color === 'green' ? 'bg-green-500' :
              range.color === 'yellow' ? 'bg-yellow-500' :
              range.color === 'orange' ? 'bg-orange-500' :
              range.color === 'dark-red' ? 'bg-rose-600' : 'bg-red-500';

            return (
              <div key={idx} className={`flex items-center justify-between p-2 rounded-lg text-sm ${isCurrent ? 'bg-muted/50 font-bold border border-border/50 shadow-sm' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                  <span className={isCurrent ? 'text-foreground' : 'text-muted-foreground'}>{range.label}</span>
                </div>
                <span className={`text-xs ${isCurrent ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                  {range.min && range.max ? `${range.min} - ${range.max}` :
                   range.min ? `≥ ${range.min}` :
                   range.max ? `< ${range.max}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CalculatorBreakdownCard({ result }: CalculatorResultProps) {
  if (!result.success || !result.data || !result.data.breakdown || result.data.breakdown.length === 0) return null;
  const items = result.data.breakdown as any[];
  // ≤4 items: tek kolon liste; 5+ items: 2 kolon grid
  const useGrid = items.length > 4;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
      <div className="border-b border-border bg-muted/20 px-5 md:px-6 py-4">
        <h3 className="font-semibold text-foreground">Detaylı Bilgiler</h3>
      </div>
      <div className="p-5 md:p-6">
        {useGrid ? (
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2.5 text-sm md:text-base border-b border-border/40 last:border-0">
                <span className="text-muted-foreground pr-2">{item.label}</span>
                <span className="font-semibold text-foreground text-right shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2.5 text-sm md:text-base border-b border-border/50 last:border-0">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground text-right">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CalculatorTableCard({ result }: CalculatorResultProps) {
  if (!result.success || !result.data || !result.data.table || result.data.table.length === 0) return null;
  const { table } = result.data as any;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 delay-150">
      <div className="border-b border-border bg-muted/20 px-5 md:px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Ödeme Planı Özeti</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/40 uppercase">
            <tr>
              {Object.keys(table[0]).map((col) => (
                <th key={col} className="px-5 md:px-6 py-4 font-semibold whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {table.slice(0, 5).map((row: any, i: number) => (
              <tr key={i} className="hover:bg-muted/10 transition-colors">
                {Object.values(row).map((val: any, j: number) => (
                  <td key={j} className="px-5 md:px-6 py-3 text-foreground/90 whitespace-nowrap">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.length > 5 && (
          <div className="p-4 text-center border-t border-border bg-muted/5">
            <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Tüm Ödeme Planını Gör ({table.length} Ay)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalculatorInfoCard({ result }: CalculatorResultProps) {
  if (!result.success || !result.data || !result.data.infoReference) return null;
  const { infoReference } = result.data as any;

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 to-background rounded-2xl border border-indigo-100/50 p-6 md:p-8 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Calculator className="w-48 h-48 text-primary" />
      </div>
      <div className="relative z-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-sm">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground">{infoReference.title}</h3>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">
          {infoReference.description}
        </p>
        <div className="flex">
          <button className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg flex items-center transition-colors">
            Daha Fazla Oku
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

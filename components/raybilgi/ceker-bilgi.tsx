"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { resolveCekerRoute } from '@/lib/raybilgi/ceker';
import { ROUTE_ESKISEHIR_HALKALI, CEKER_LOCOMOTIVES } from '@/lib/raybilgi/ceker-data';
import { AlertCircle, Train, MapPin, ArrowRight, ChevronDown, Check, ArrowLeftRight, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Helper for Turkish search
function normalizeForSearch(str: string) {
  return str.toLocaleLowerCase('tr-TR')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function StationPickerModal({
  open,
  onClose,
  value,
  onChange,
  options,
  title
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  title: string;
}) {
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSearch('');
      setHighlightedIndex(-1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const s = normalizeForSearch(search);
    
    const isSubsequence = (searchStr: string, textStr: string) => {
      let i = 0, j = 0;
      while (i < searchStr.length && j < textStr.length) {
        if (searchStr[i] === textStr[j]) i++;
        j++;
      }
      return i === searchStr.length;
    };

    return options.filter(opt => {
      const normalizedOpt = normalizeForSearch(opt);
      return normalizedOpt.includes(s) || isSubsequence(s, normalizedOpt);
    });
  }, [search, options]);

  useEffect(() => {
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [search, filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
      scrollToIndex(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
      scrollToIndex(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        onChange(filtered[highlightedIndex]);
        onClose();
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (!listRef.current) return;
    const item = listRef.current.children[index] as HTMLElement;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-background sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[70vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors">
             <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-3 border-b bg-muted/30">
          <div className="relative flex items-center">
             <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
             <input 
               autoFocus 
               className="w-full h-10 pl-9 pr-4 text-sm bg-background border border-input rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
               placeholder="İstasyon ara..."
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </div>
        </div>
        <div className="overflow-y-auto p-2 flex-1" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="py-8 text-sm text-muted-foreground text-center">İstasyon bulunamadı</div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={opt}
                className={cn(
                  "px-3 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between rounded-lg m-1",
                  value === opt && "bg-violet-50 text-violet-900 font-semibold",
                  highlightedIndex === i && value !== opt && "bg-accent text-accent-foreground"
                )}
                onMouseEnter={() => setHighlightedIndex(i)}
                onClick={() => {
                  onChange(opt);
                  onClose();
                }}
              >
                {opt}
                {value === opt && <Check className="w-4 h-4 text-violet-600 shrink-0 ml-2" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function CekerBilgi() {
  const allStations = [...ROUTE_ESKISEHIR_HALKALI].sort((a, b) => a.localeCompare(b, 'tr'));

  const [startStation, setStartStation] = useState<string>('');
  const [endStation, setEndStation] = useState<string>('');
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);
  
  const [result, setResult] = useState<ReturnType<typeof resolveCekerRoute> | null>(null);

  const handleCalculate = () => {
    if (!startStation || !endStation) return;
    const res = resolveCekerRoute(startStation, endStation);
    setResult(res);
  };

  const handleSwap = () => {
    const temp = startStation;
    setStartStation(endStation);
    setEndStation(temp);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] rounded-2xl p-6 md:p-8">
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-muted/20 p-3 sm:p-5 rounded-2xl border border-border/50">
            {/* Start Field */}
            <div className="flex-1 w-full relative">
              <span className="absolute left-4 top-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pointer-events-none">Nereden</span>
              <button 
                onClick={() => setPickerOpen('start')}
                className="w-full text-left px-4 pt-7 pb-2.5 border border-input rounded-xl bg-background hover:border-violet-400 hover:shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all flex items-center justify-between"
              >
                <span className={cn("text-[15px] truncate", startStation ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {startStation || 'Başlangıç İstasyonu'}
                </span>
                <ChevronDown className="w-4 h-4 opacity-40 shrink-0 ml-2" />
              </button>
            </div>

            {/* Swap Button */}
            <button 
              onClick={handleSwap}
              className="shrink-0 p-2.5 bg-background border border-border shadow-sm hover:bg-muted hover:text-foreground text-muted-foreground rounded-full transition-colors z-10 -my-3 sm:my-0 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              title="İstasyonları Yer Değiştir"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* End Field */}
            <div className="flex-1 w-full relative">
              <span className="absolute left-4 top-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pointer-events-none">Nereye</span>
              <button 
                onClick={() => setPickerOpen('end')}
                className="w-full text-left px-4 pt-7 pb-2.5 border border-input rounded-xl bg-background hover:border-violet-400 hover:shadow-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all flex items-center justify-between"
              >
                <span className={cn("text-[15px] truncate", endStation ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {endStation || 'Varış İstasyonu'}
                </span>
                <ChevronDown className="w-4 h-4 opacity-40 shrink-0 ml-2" />
              </button>
            </div>
          </div>

          <Button 
            onClick={handleCalculate}
            disabled={!startStation || !endStation}
            className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-base font-semibold shadow-sm transition-all"
          >
            Çeker Bilgisini Göster
          </Button>
        </div>

      </div>

      {result && (
        <div className="bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] rounded-2xl p-6 md:p-8 overflow-hidden">
          {!result.success ? (
            <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium text-sm">
                {result.error === 'same_station' 
                  ? 'Başlangıç ve varış istasyonları farklı olmalıdır.'
                  : 'Bu güzergâh henüz tanımlı değil.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Route Summary */}
              <div className="flex flex-col gap-1 pb-4 border-b border-border/40">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Güzergâh</span>
                <div className="flex items-center flex-wrap gap-2 text-lg font-semibold text-foreground">
                  <span>{startStation}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
                  <span>{endStation}</span>
                </div>
              </div>

              {/* Detail Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lokomotif Kanca Çekeri Limitleri</h3>
                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-y-2.5">
                    <thead>
                      <tr>
                        <th className="pb-1 pl-4 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lokomotif</th>
                        <th className="pb-1 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Azami Kanca Çekeri</th>
                        <th className="pb-1 pr-4 pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sınırlayıcı Kesim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.locomotives.map((locoRes, i) => {
                        const label = CEKER_LOCOMOTIVES.find(l => l.id === locoRes.locomotive)?.label || locoRes.locomotive;
                        return (
                          <tr 
                            key={locoRes.locomotive} 
                            className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass-subtle)] bg-[var(--color-glass-bg)] backdrop-blur-[6px] shadow-sm"
                          >
                            <td className="py-4 pl-4 pr-4 font-medium text-foreground border-y border-l border-[var(--color-glass-border)] rounded-l-xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-violet-100/50 group-hover:bg-violet-100 transition-colors">
                                  <Train className="w-4 h-4 text-violet-600" />
                                </div>
                                <span className="font-semibold text-[15px]">{label}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center border-y border-[var(--color-glass-border)]">
                              {locoRes.missingData ? (
                                <span className="text-muted-foreground text-xs font-medium px-2 py-1 bg-muted rounded-md">Veri bulunamadı</span>
                              ) : (
                                <span className="inline-flex items-baseline gap-1 font-bold text-foreground text-[22px] tabular-nums tracking-tight">
                                  {locoRes.maxTonnage} <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ton</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 pr-4 pl-4 font-medium text-muted-foreground border-y border-r border-[var(--color-glass-border)] rounded-r-xl">
                              {!locoRes.missingData && locoRes.limitingSections.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  {locoRes.limitingSections.map((sec, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-[13px] bg-background/50 border border-border/30 rounded-lg px-2.5 py-1 w-max group-hover:bg-background transition-colors">
                                      <span className="text-foreground font-medium">{sec.from}</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                                      <span className="text-foreground font-medium">{sec.to}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Station Picker Modal */}
      <StationPickerModal 
        open={pickerOpen !== null}
        onClose={() => setPickerOpen(null)}
        value={pickerOpen === 'start' ? startStation : endStation}
        onChange={v => {
          if (pickerOpen === 'start') setStartStation(v);
          else if (pickerOpen === 'end') setEndStation(v);
        }}
        options={allStations}
        title={pickerOpen === 'start' ? 'Başlangıç İstasyonu Seçin' : 'Varış İstasyonu Seçin'}
      />
    </div>
  );
}

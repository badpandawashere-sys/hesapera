"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { resolveCekerRoute } from '@/lib/raybilgi/ceker';
import { ROUTE_ESKISEHIR_HALKALI, CEKER_LOCOMOTIVES } from '@/lib/raybilgi/ceker-data';
import { AlertCircle, Train, MapPin, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Helper for Turkish search
function normalizeForSearch(str: string) {
  return str.toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function StationCombobox({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  options: string[]; 
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return options;
    const s = normalizeForSearch(search);
    return options.filter(opt => normalizeForSearch(opt).includes(s));
  }, [search, options]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className={cn(
          "flex items-center justify-between w-full h-11 px-3 rounded-lg border bg-background text-sm cursor-text transition-colors",
          open ? "border-violet-500 ring-1 ring-violet-500" : "border-border hover:border-violet-300"
        )}
        onClick={() => setOpen(true)}
      >
        {open ? (
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none border-none placeholder:text-muted-foreground min-w-0"
            placeholder="İstasyon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        ) : (
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
        )}
        <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0 ml-2" />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">İstasyon bulunamadı</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-violet-50 hover:text-violet-900 transition-colors flex items-center justify-between",
                  value === opt && "bg-violet-50/50 text-violet-900 font-medium"
                )}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
                {value === opt && <Check className="w-4 h-4 text-violet-600" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CekerBilgi() {
  const allStations = [...ROUTE_ESKISEHIR_HALKALI].sort((a, b) => a.localeCompare(b, 'tr'));

  const [startStation, setStartStation] = useState<string>('');
  const [endStation, setEndStation] = useState<string>('');
  
  const [result, setResult] = useState<ReturnType<typeof resolveCekerRoute> | null>(null);

  const handleCalculate = () => {
    if (!startStation || !endStation) return;
    const res = resolveCekerRoute(startStation, endStation);
    setResult(res);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] rounded-2xl p-6 md:p-8">
        
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Başlangıç İstasyonu</label>
              <StationCombobox 
                value={startStation} 
                onChange={setStartStation} 
                options={allStations} 
                placeholder="İstasyon Seçin..." 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Varış İstasyonu</label>
              <StationCombobox 
                value={endStation} 
                onChange={setEndStation} 
                options={allStations} 
                placeholder="İstasyon Seçin..." 
              />
            </div>
          </div>

          <Button 
            onClick={handleCalculate}
            disabled={!startStation || !endStation}
            className="w-full h-12 mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-base font-semibold"
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
            <div className="space-y-8">
              
              {/* Route Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Güzergâh Özeti</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-foreground font-medium p-4 rounded-xl bg-violet-50/50 border border-violet-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-600" />
                    <span>{startStation}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-violet-400 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-600" />
                    <span>{endStation}</span>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lokomotif Kanca Çekeri Limitleri</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-3 pr-4 font-semibold text-muted-foreground">Lokomotif</th>
                        <th className="pb-3 px-4 font-semibold text-muted-foreground text-center">Azami Kanca Çekeri</th>
                        <th className="pb-3 pl-4 font-semibold text-muted-foreground">Sınırlayıcı Kesim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {result.locomotives.map((locoRes, i) => {
                        const label = CEKER_LOCOMOTIVES.find(l => l.id === locoRes.locomotive)?.label || locoRes.locomotive;
                        return (
                          <tr key={locoRes.locomotive} className="transition-colors hover:bg-muted/30">
                            <td className="py-4 pr-4 font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                <Train className="w-4 h-4 text-violet-500" />
                                {label}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {locoRes.missingData ? (
                                <span className="text-muted-foreground text-xs font-medium px-2 py-1 bg-muted rounded-md">Veri bulunamadı</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-violet-700 text-base">
                                  {locoRes.maxTonnage} <span className="text-xs font-medium text-violet-500 uppercase">ton</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 pl-4 font-medium text-amber-800">
                              {!locoRes.missingData && locoRes.limitingSections.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  {locoRes.limitingSections.map((sec, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-100 rounded px-2 py-1 w-max">
                                      <span className="font-semibold text-amber-900">{sec.from}</span>
                                      <ArrowRight className="w-3 h-3 text-amber-500" />
                                      <span className="font-semibold text-amber-900">{sec.to}</span>
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
    </div>
  );
}

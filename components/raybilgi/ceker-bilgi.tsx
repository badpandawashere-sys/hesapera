"use client";

import { useState } from 'react';
import { resolveCekerRoute } from '@/lib/raybilgi/ceker';
import { LocoType, ROUTE_ESKISEHIR_HALKALI, CEKER_LOCOMOTIVES } from '@/lib/raybilgi/ceker-data';
import { AlertCircle, Train, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CekerBilgi() {
  // Use a combined set of stations for the comboboxes
  // Since reverse is the exact same set, we just need one list.
  // Actually, ROUTE_ESKISEHIR_HALKALI has all 61 unique stations in order.
  // We'll sort them alphabetically for the dropdown.
  const allStations = [...ROUTE_ESKISEHIR_HALKALI].sort((a, b) => a.localeCompare(b, 'tr'));

  const [startStation, setStartStation] = useState<string>('');
  const [endStation, setEndStation] = useState<string>('');
  const [loco, setLoco] = useState<LocoType>('DE22000');
  
  const [result, setResult] = useState<ReturnType<typeof resolveCekerRoute> | null>(null);

  const handleCalculate = () => {
    if (!startStation || !endStation || !loco) return;
    const res = resolveCekerRoute(startStation, endStation, loco);
    setResult(res);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-[var(--color-glass-bg)] backdrop-blur-[12px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-subtle)] rounded-2xl p-6 md:p-8">
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Başlangıç İstasyonu</label>
            <select
              value={startStation}
              onChange={(e) => setStartStation(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">İstasyon Seçin...</option>
              {allStations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Varış İstasyonu</label>
            <select
              value={endStation}
              onChange={(e) => setEndStation(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">İstasyon Seçin...</option>
              {allStations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">Lokomotif Tipi</label>
            <select
              value={loco}
              onChange={(e) => setLoco(e.target.value as LocoType)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm"
            >
              {CEKER_LOCOMOTIVES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>

          <Button 
            onClick={handleCalculate}
            disabled={!startStation || !endStation}
            className="w-full h-12 mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-base font-semibold"
          >
            Çeker Bilgisini Hesapla
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
              {/* Header result */}
              <div className="flex flex-col items-center justify-center p-6 bg-violet-50 rounded-2xl border border-violet-100 text-center">
                <p className="text-sm font-semibold tracking-wider text-violet-700 uppercase mb-2">Azami Kanca Çekeri</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold text-violet-900 tracking-tight">{result.minTonnage}</span>
                  <span className="text-xl font-medium text-violet-700">ton</span>
                </div>
              </div>

              {/* Limiting Section */}
              <div className="flex flex-col gap-3 p-5 rounded-xl border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Sınırlayıcı Kesim</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-amber-950 font-medium">
                  <span className="px-2.5 py-1 bg-amber-100/50 rounded-md border border-amber-200/50">{result.limitingEdge.from}</span>
                  <ArrowRight className="w-4 h-4 text-amber-600/50" />
                  <span className="px-2.5 py-1 bg-amber-100/50 rounded-md border border-amber-200/50">{result.limitingEdge.to}</span>
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Güzergâh Özeti</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-foreground font-medium p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-600" />
                    <span>{startStation}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-violet-600" />
                    <span>{CEKER_LOCOMOTIVES.find(l => l.id === loco)?.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-600" />
                    <span>{endStation}</span>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Kesim Detayları</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="pb-3 font-semibold text-muted-foreground">Kalkış</th>
                        <th className="pb-3 font-semibold text-muted-foreground">Varış</th>
                        <th className="pb-3 font-semibold text-muted-foreground text-right">Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {result.edges.map((edge, i) => {
                        const isLimiting = edge === result.limitingEdge;
                        return (
                          <tr key={i} className={cn("transition-colors", isLimiting ? "bg-amber-50/50" : "")}>
                            <td className="py-3 font-medium text-foreground">{edge.from}</td>
                            <td className="py-3 font-medium text-foreground">{edge.to}</td>
                            <td className={cn(
                              "py-3 text-right font-semibold",
                              isLimiting ? "text-amber-700" : "text-foreground"
                            )}>
                              {edge.limits[loco]} ton
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

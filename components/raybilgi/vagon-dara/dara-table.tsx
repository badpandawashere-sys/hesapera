'use client';

import React from 'react';
import { DaraWagonRow } from '@/lib/raybilgi/vagon-dara-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, AlertTriangle, CheckCircle2, HelpCircle, Copy, Info } from 'lucide-react';

interface DaraTableProps {
  rows: DaraWagonRow[];
  onUpdateRow: (id: string, field: 'regime' | 'serial' | 'wagonNo', value: string) => void;
  onRemoveRow: (id: string) => void;
}

export function DaraTable({ rows, onUpdateRow, onRemoveRow }: DaraTableProps) {
  if (rows.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <Info className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-foreground">Henüz Vagon Eklenmedi</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Yukarıdaki sekmelerden fotoğraf yükleyebilir, Saha Vaziyeti listesi yapıştırabilir veya
          &ldquo;+ Vagon Ekle&rdquo; butonu ile manuel ekleme yapabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-[11px] md:text-xs uppercase font-bold tracking-wider">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-3 w-24">Rejim</th>
              <th className="py-3 px-3 w-24">Seri</th>
              <th className="py-3 px-3 w-32">Vagon No</th>
              <th className="py-3 px-3 w-24">Tip</th>
              <th className="py-3 px-3 w-28 text-right">Dara (t)</th>
              <th className="py-3 px-3 w-20 text-center">Dingil</th>
              <th className="py-3 px-3 w-24 text-right">Boy (m)</th>
              <th className="py-3 px-3 min-w-[130px]">Durum</th>
              <th className="py-3 px-3 text-center w-16">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, idx) => {
              const isExcluded = row.isDuplicate || row.status !== 'resolved';

              return (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-muted/30 ${
                    row.isDuplicate
                      ? 'bg-amber-50/30 dark:bg-amber-950/20'
                      : row.status === 'unknown_serial'
                      ? 'bg-rose-50/20 dark:bg-rose-950/10'
                      : ''
                  }`}
                >
                  {/* Sıra */}
                  <td className="py-2.5 px-3 text-center text-xs text-muted-foreground font-mono">
                    {idx + 1}
                  </td>

                  {/* Rejim */}
                  <td className="py-2.5 px-3">
                    <Input
                      value={row.regime}
                      onChange={(e) => onUpdateRow(row.id, 'regime', e.target.value)}
                      placeholder="3175"
                      maxLength={4}
                      className="h-8 text-xs font-mono w-20 bg-background"
                    />
                  </td>

                  {/* Seri */}
                  <td className="py-2.5 px-3">
                    <Input
                      value={row.serial}
                      onChange={(e) => onUpdateRow(row.id, 'serial', e.target.value)}
                      placeholder="2461"
                      maxLength={6}
                      className={`h-8 text-xs font-mono font-semibold w-20 bg-background ${
                        row.status === 'unknown_serial' ? 'border-amber-500 ring-1 ring-amber-500/20' : ''
                      }`}
                    />
                  </td>

                  {/* Vagon No */}
                  <td className="py-2.5 px-3">
                    <Input
                      value={row.wagonNo}
                      onChange={(e) => onUpdateRow(row.id, 'wagonNo', e.target.value)}
                      placeholder="776-8"
                      className="h-8 text-xs font-mono w-28 bg-background"
                    />
                  </td>

                  {/* Vagon Tipi (Otomatik) */}
                  <td className="py-2.5 px-3 font-semibold text-foreground">
                    {row.wagonType ? (
                      <span className="px-2 py-0.5 rounded bg-muted text-foreground text-xs font-mono">
                        {row.wagonType}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Dara (t) (Otomatik) */}
                  <td className="py-2.5 px-3 text-right">
                    {row.tare != null ? (
                      <span
                        className={`font-mono font-bold ${
                          isExcluded ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'
                        }`}
                      >
                        {row.tare.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        <span className="text-[11px] font-normal text-muted-foreground">t</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Dingil */}
                  <td className="py-2.5 px-3 text-center text-xs font-mono text-muted-foreground">
                    {row.axle != null ? row.axle : '—'}
                  </td>

                  {/* Uzunluk */}
                  <td className="py-2.5 px-3 text-right text-xs font-mono text-muted-foreground">
                    {row.length != null
                      ? `${row.length.toLocaleString('tr-TR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} m`
                      : '—'}
                  </td>

                  {/* Durum Rozeti */}
                  <td className="py-2.5 px-3">
                    {row.status === 'resolved' && !row.isDuplicate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Tanımlandı
                      </span>
                    )}

                    {row.status === 'duplicate' && (
                      <span
                        title={row.statusMessage}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      >
                        <Copy className="w-3 h-3" />
                        Mükerrer Vagon
                      </span>
                    )}

                    {row.status === 'unknown_serial' && (
                      <span
                        title={row.statusMessage}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Bilinmeyen Seri
                      </span>
                    )}

                    {row.status === 'incomplete' && (
                      <span
                        title={row.statusMessage}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border"
                      >
                        <HelpCircle className="w-3 h-3" />
                        Eksik Numara
                      </span>
                    )}
                  </td>

                  {/* Sil */}
                  <td className="py-2.5 px-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveRow(row.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Vagonu Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import { DaraTotals } from '@/lib/raybilgi/vagon-dara-engine';
import { Scale, TrainTrack, AlertTriangle, CheckCircle2, Ruler } from 'lucide-react';

interface DaraSummaryCardsProps {
  totals: DaraTotals;
}

export function DaraSummaryCards({ totals }: DaraSummaryCardsProps) {
  const formattedTare = totals.totalTare.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedLength = totals.totalLength.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Toplam Dara - Hero Metric Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-3 -top-3 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs uppercase font-bold tracking-wider text-violet-200">
            Toplam Vagon Darası
          </span>
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
            <Scale className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              {formattedTare}
            </span>
            <span className="text-lg font-semibold text-violet-200">ton (t)</span>
          </div>
          <p className="text-xs text-violet-200/80 mt-1">
            Yalnızca tanımlanan vagonlar hesaba katılır
          </p>
        </div>
      </div>

      {/* 2. Toplam Vagon */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Toplam Vagon Sayısı
          </span>
          <div className="p-2 bg-muted text-foreground rounded-xl">
            <TrainTrack className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-foreground">
            {totals.totalCount}{' '}
            <span className="text-base font-normal text-muted-foreground">adet</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Listeye eklenen toplam vagon sayısı
          </p>
        </div>
      </div>

      {/* 3. Tanımlanan Vagon */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Tanımlanan Vagon
          </span>
          <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {totals.resolvedCount}{' '}
            <span className="text-base font-normal text-muted-foreground">adet</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kayıtları eşleşen ve darası bulunan
          </p>
        </div>
      </div>

      {/* 4. Kontrol Gerekli (Bilinmeyen / Eksik / Mükerrer) */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Kontrol Gerekli
          </span>
          <div
            className={`p-2 rounded-xl ${
              totals.controlNeededCount > 0
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div
            className={`text-3xl font-extrabold tracking-tight ${
              totals.controlNeededCount > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-foreground'
            }`}
          >
            {totals.controlNeededCount}{' '}
            <span className="text-base font-normal text-muted-foreground">adet</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totals.duplicateCount > 0
              ? `${totals.duplicateCount} mükerrer vagon tespit edildi`
              : totals.controlNeededCount > 0
              ? 'Eksik veya kaydı bulunmayan seri'
              : 'Tüm vagonlar eksiksiz ve geçerli'}
          </p>
        </div>
      </div>

      {/* Ek Bilgi Çubuğu (Dingil ve Uzunluk) */}
      {(totals.totalAxles > 0 || totals.totalLength > 0) && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="w-2 h-2 rounded-full bg-violet-600" />
              Toplam Dingil (Aks):{' '}
              <strong className="text-foreground">{totals.totalAxles}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Ruler className="w-3.5 h-3.5 text-violet-600" />
              Toplam Dizi Uzunluğu:{' '}
              <strong className="text-foreground">{formattedLength} m</strong>
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            *Dingil ve uzunluk değerleri tanımlanan vagonlar üzerinden hesaplanmıştır.
          </span>
        </div>
      )}
    </div>
  );
}

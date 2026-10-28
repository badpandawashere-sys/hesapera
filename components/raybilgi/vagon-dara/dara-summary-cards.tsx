import React from 'react';
import { DaraTotals } from '@/lib/raybilgi/vagon-dara-engine';
import { Scale, TrainTrack, Ruler, CheckCircle2 } from 'lucide-react';

interface DaraSummaryCardsProps {
  totals: DaraTotals;
}

export function DaraSummaryCards({ totals }: DaraSummaryCardsProps) {
  const formattedLength = totals.totalLength.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedTare = totals.totalTare.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {/* 1. Toplam Tren Uzunluğu - Hero Metric Card (Öncelik 1) */}
      <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-3 -top-3 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs uppercase font-bold tracking-wider text-violet-200">
            Toplam Tren Uzunluğu
          </span>
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
            <Ruler className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-extrabold tracking-tight font-mono">
              {formattedLength}
            </span>
            <span className="text-lg font-semibold text-violet-200">m</span>
          </div>
          <p className="text-xs text-violet-200/80 mt-1">
            Tampondan tampona toplam dizi boyu
          </p>
        </div>
      </div>

      {/* 2. Hesaplanan Vagon (Öncelik 2) */}
      <div className="col-span-1 p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Hesaplanan Vagon
          </span>
          <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {totals.resolvedCount}{' '}
            <span className="text-sm sm:text-base font-normal text-muted-foreground">
              / {totals.totalCount} adet
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {totals.totalCount === 0
              ? 'Listeye vagon ekleyin'
              : totals.resolvedCount === totals.totalCount
              ? 'Tüm vagonlar hesaba dahil edildi'
              : `${totals.totalCount - totals.resolvedCount} vagon hesap dışı (tanımsız seri)`}
          </p>
        </div>
      </div>

      {/* 3. Toplam Dara (Öncelik 3 - İkincil Bilgi) */}
      <div className="col-span-1 p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Toplam Dara
          </span>
          <div className="p-2 bg-muted text-foreground rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {formattedTare}{' '}
            <span className="text-sm sm:text-base font-normal text-muted-foreground">t</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            Dara bilgisi bulunan vagonlar toplamı
          </p>
        </div>
      </div>

      {/* 4. Toplam Dingil / Aks (Öncelik 4 - Yardımcı Parametre) */}
      <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Toplam Dingil (Aks)
          </span>
          <div className="p-2 bg-muted text-foreground rounded-xl">
            <TrainTrack className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {totals.totalAxles}{' '}
            <span className="text-sm sm:text-base font-normal text-muted-foreground">dingil</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            Dizi aks adedi ve teknik yük dağılımı
          </p>
        </div>
      </div>
    </div>
  );
}

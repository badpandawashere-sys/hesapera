'use client';

import React, { useState, useMemo } from 'react';
import { WagonRecord } from '@/types/raybilgi';
import {
  DaraWagonInput,
  resolveWagonsForTare,
  calculateTareTotals,
} from '@/lib/raybilgi/vagon-dara-engine';
import { DaraSummaryCards } from './dara-summary-cards';
import { PhotoInput } from './photo-input';
import { PasteInput } from './paste-input';
import { DaraTable } from './dara-table';
import { Button } from '@/components/ui/button';
import {
  Camera,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { ExtractedWagonIdentity } from '@/lib/raybilgi/ocr-client';

interface VagonDaraDashboardProps {
  wagonLookup: Record<string, WagonRecord>;
}

export function VagonDaraDashboard({ wagonLookup }: VagonDaraDashboardProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'paste'>('photo');
  const [rows, setRows] = useState<DaraWagonInput[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Live resolution against canonical technical reference
  const resolvedRows = useMemo(() => {
    return resolveWagonsForTare(rows, wagonLookup);
  }, [rows, wagonLookup]);

  // Live total calculations (only resolved & non-duplicate rows count)
  const totals = useMemo(() => {
    return calculateTareTotals(resolvedRows);
  }, [resolvedRows]);

  // Actions
  const handleIdentitiesExtracted = (extracted: ExtractedWagonIdentity[]) => {
    const newInputs: DaraWagonInput[] = extracted.map((w, idx) => ({
      id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      regime: w.regime || '',
      serial: w.serial || '',
      wagonNo: w.wagonNo || '',
      rawText: w.rawText,
      source: 'photo',
      confidence: w.confidence,
      confidenceWarning: w.confidenceWarning,
    }));
    setRows((prev) => [...prev, ...newInputs]);
  };

  const handleWagonsParsed = (newInputs: DaraWagonInput[]) => {
    setRows((prev) => [...prev, ...newInputs]);
  };

  const handleAddManualRow = () => {
    const newRow: DaraWagonInput = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      regime: '3175',
      serial: '',
      wagonNo: '',
      source: 'manual',
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleUpdateRow = (
    id: string,
    field: 'regime' | 'serial' | 'wagonNo',
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: value,
              confidenceWarning: undefined,
            }
          : r
      )
    );
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    if (rows.length === 0) return;
    if (window.confirm('Listedeki tüm vagonları temizlemek istediğinize emin misiniz?')) {
      setRows([]);
    }
  };

  const handleCopySummary = async () => {
    if (resolvedRows.length === 0) return;

    const formattedLength = totals.totalLength.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedTare = totals.totalTare.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let text = `RAYBİLGİ VAGON METRE ÖLÇER ÖZETİ\n`;
    text += `Toplam Tren Uzunluğu: ${formattedLength} metre (m)\n`;
    text += `Hesaplanan Vagon: ${totals.resolvedCount} / ${totals.totalCount} adet\n`;
    text += `Toplam Dara: ${formattedTare} ton (t)\n`;
    text += `Toplam Dingil: ${totals.totalAxles} dingil\n`;
    if (totals.controlNeededCount > 0) {
      text += `Kontrol Bekleyen: ${totals.controlNeededCount} vagon\n`;
    }
    text += `\nVAGON LİSTESİ:\n`;
    text += `Sıra\tRejim\tSeri\tVagon No\tTip\tBoy (m)\tDara (t)\tDingil\tDurum\n`;

    resolvedRows.forEach((r, i) => {
      text += `${i + 1}\t${r.regime}\t${r.serial}\t${r.wagonNo}\t${r.wagonType || '-'}\t${
        r.length != null ? r.length.toLocaleString('tr-TR') : '-'
      }\t${
        r.tare != null ? r.tare.toLocaleString('tr-TR') : '-'
      }\t${r.axle != null ? r.axle : '-'}\t${r.status}\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Özet Metrik Kartları */}
      <DaraSummaryCards totals={totals} />

      {/* 2. Giriş Modu Seçimi (Tabs) */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'photo'
              ? 'border-violet-600 text-violet-700 dark:text-violet-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-4 h-4" />
          Fotoğraf / Kamera
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'paste'
              ? 'border-violet-600 text-violet-700 dark:text-violet-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          Metin / Liste Yapıştır
        </button>
      </div>

      {/* 3. Aktif Giriş Paneli */}
      {activeTab === 'photo' ? (
        <PhotoInput
          onIdentitiesExtracted={handleIdentitiesExtracted}
          onSwitchToPaste={() => setActiveTab('paste')}
          onAddManualRow={handleAddManualRow}
        />
      ) : (
        <PasteInput onWagonsParsed={handleWagonsParsed} />
      )}

      {/* 4. Tablo Araç Çubuğu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-foreground">
            Vagon Çalışma Listesi ({rows.length})
          </h3>
          {totals.controlNeededCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20">
              {totals.controlNeededCount} vagon kontrol bekliyor
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddManualRow}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-violet-600" />
            <span>+ Vagon Ekle</span>
          </Button>

          {rows.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="flex items-center gap-1.5"
              >
                {copyFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Özeti Kopyala</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tümünü Temizle</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 5. Vagon Tablosu */}
      <DaraTable
        rows={resolvedRows}
        onUpdateRow={handleUpdateRow}
        onRemoveRow={handleRemoveRow}
      />
    </div>
  );
}

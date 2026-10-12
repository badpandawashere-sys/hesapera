'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, AlertCircle, Check, Trash2 } from 'lucide-react';
import { parsePasteForDara, DaraWagonInput } from '@/lib/raybilgi/vagon-dara-engine';

interface PasteInputProps {
  onWagonsParsed: (wagons: DaraWagonInput[]) => void;
  disabled?: boolean;
}

export function PasteInput({ onWagonsParsed, disabled = false }: PasteInputProps) {
  const [pasteText, setPasteText] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const handleParseAndAdd = () => {
    if (!pasteText.trim()) {
      setFeedback({
        type: 'error',
        message: 'Lütfen yapıştırılacak vagon verisi girin.',
      });
      return;
    }

    const { rows, truncated, totalLinesFound } = parsePasteForDara(pasteText, 200);

    if (rows.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Girdiğiniz metinde geçerli vagon verisi tespit edilemedi.',
      });
      return;
    }

    onWagonsParsed(rows);
    setPasteText('');

    if (truncated) {
      setFeedback({
        type: 'warning',
        message: `Toplam ${totalLinesFound} vagon satırından ilk 200 vagon eklendi (Maksimum 200 sınırı).`,
      });
    } else {
      setFeedback({
        type: 'success',
        message: `${rows.length} vagon başarıyla listeye eklendi.`,
      });
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            Metin veya Tablo Yapıştır
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Saha Vaziyeti panosu (3-6 sütun), Excel veya 12 haneli vagon listesini doğrudan yapıştırın.
          </p>
        </div>
      </div>

      <textarea
        value={pasteText}
        onChange={(e) => {
          setPasteText(e.target.value);
          if (feedback) setFeedback(null);
        }}
        disabled={disabled}
        placeholder={`Örnek Formatlar:
3175    2461    776-8    KAYSERİ
3175    2461    776-8    KAYSERİ    25,5
31752461776-8
2461 776-8`}
        rows={5}
        className="w-full p-3 font-mono text-xs md:text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-y"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          * Tek seferde en fazla 200 vagon eklenebilir. Tablo başlık satırları otomatik filtrelenir.
        </span>

        <div className="flex items-center gap-2">
          {pasteText && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPasteText('');
                setFeedback(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleParseAndAdd}
            disabled={disabled || !pasteText.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Listeyi Çözümle ve Ekle
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : feedback.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}

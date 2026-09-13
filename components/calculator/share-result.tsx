'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { CalculatorResultData } from '@/calculators/core/calculator-result';

interface ShareResultProps {
  calculatorName: string;
  slug: string;
  data: CalculatorResultData<any, any>;
  className?: string;
}

export function ShareResult({ calculatorName, slug, data, className = '' }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const url = `https://hesapera.com.tr/hesaplama/${slug}`;

  const handleShare = async () => {
    let text = `Hesapera - ${calculatorName}\n\n`;

    if (data.primaryLabel && data.primaryResult) {
      text += `${data.primaryLabel}: ${data.primaryResult}\n`;
    } else if (data.primaryResult) {
      text += `Sonuç: ${data.primaryResult}\n`;
    }
    text += '\n';

    if (data.secondaryResults) {
      for (const [key, value] of Object.entries(data.secondaryResults)) {
        if (typeof value !== 'object') {
          text += `${key}: ${value}\n`;
        }
      }
    }

    text += `\n${url}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Hesapera - ${calculatorName}`,
          text: text,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        throw new Error('Share not supported');
      }
    } catch (err: any) {
      // Ignore AbortError (user cancelled share)
      if (err.name !== 'AbortError') {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    }
  };

  return (
    <div className={`mt-4 w-full flex justify-end ${className}`}>
      <button
        onClick={handleShare}
        className="group relative flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-600">Kopyalandı</span>
          </>
        ) : error ? (
          <span className="text-red-500">Hata Oluştu</span>
        ) : (
          <>
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Paylaş
          </>
        )}
      </button>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export type AdPlacement = 
  | 'calculator-after-result'
  | 'calculator-after-content'
  | 'homepage-after-popular'
  | 'homepage-after-categories';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

export function AdBanner({ placement, className }: AdBannerProps) {
  return (
    <div className={cn("w-full flex justify-center items-center py-6 md:py-8 overflow-hidden", className)}>
      <div 
        className="flex items-center justify-center w-full max-w-[728px] min-h-[90px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-4 select-none"
        aria-label="Reklam Alanı"
      >
        <span className="text-slate-400 font-medium text-sm tracking-wide">
          Reklam
        </span>
      </div>
    </div>
  );
}

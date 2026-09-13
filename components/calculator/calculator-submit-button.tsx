import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CalculatorSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  text?: string;
}

export function CalculatorSubmitButton({ isLoading, text = 'Hesapla', className, ...props }: CalculatorSubmitButtonProps) {
  return (
    <Button 
      {...props}
      className={`w-full h-[56px] rounded-full flex items-center justify-center gap-[10px] transition-all duration-300 bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#0EA5E9] shadow-[0_12px_32px_-8px_rgba(124,58,237,0.6),inset_0_2px_1px_rgba(255,255,255,0.4),inset_0_-2px_2px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_-8px_rgba(124,58,237,0.7),inset_0_2px_1px_rgba(255,255,255,0.5),inset_0_-2px_2px_rgba(0,0,0,0.15)] hover:brightness-105 active:scale-[0.98] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 disabled:from-slate-200 disabled:to-slate-200 disabled:shadow-none disabled:text-slate-500 text-white text-[22px] font-bold tracking-tight border-0 group relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[45%] before:rounded-t-full before:bg-gradient-to-b before:from-white/20 before:to-transparent ${className || ''}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <Loader2 className="w-[30px] h-[30px] animate-spin text-white relative z-10" />
      ) : (
        <img 
          src="/hesapera_h_logo_transparent_cropped.png" 
          alt="Hesapera" 
          className="h-[36px] w-auto object-contain group-disabled:opacity-50 group-disabled:grayscale drop-shadow-md relative z-10" 
        />
      )}
      <span className="relative z-10">{text}</span>
    </Button>
  );
}

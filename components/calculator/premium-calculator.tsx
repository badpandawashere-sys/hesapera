import type { ComponentProps, ReactNode } from 'react';
import { cn } from 'cn';
import { CalculatorSubmitButton } from './calculator-submit-button';

interface PremiumCalculatorShellProps {
  form: ReactNode;
  result: ReactNode;
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function PremiumCalculatorShell({
  form,
  result,
  children,
  isLoading = false,
  className,
}: PremiumCalculatorShellProps) {
  return (
    <div className={cn('w-full max-w-6xl mx-auto space-y-10', className)}>
      <div className="bg-[var(--color-glass-bg-solid)] backdrop-blur-[24px] rounded-[2.5rem] shadow-[var(--shadow-glass-standard)] border border-[var(--color-glass-border)] p-6 md:p-10 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 blur-3xl lg:blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/5 blur-3xl lg:blur-[100px] rounded-full pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">
          <div className="lg:col-span-7 flex flex-col space-y-10">{form}</div>
          <div className="lg:col-span-5" aria-live="polite" aria-busy={isLoading}>
            {result}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

interface PremiumCalculatorSubmitProps
  extends Omit<ComponentProps<typeof CalculatorSubmitButton>, 'className'> {
  buttonClassName?: string;
  containerClassName?: string;
  footer?: ReactNode;
}

export function PremiumCalculatorSubmit({
  buttonClassName,
  containerClassName,
  footer,
  ...props
}: PremiumCalculatorSubmitProps) {
  return (
    <div
      className={cn(
        footer
          ? 'w-full flex flex-col items-center gap-4 mt-6'
          : 'w-full flex justify-center mt-6',
        containerClassName,
      )}
    >
      <div className="w-full max-w-[280px]">
        <CalculatorSubmitButton
          {...props}
          className={cn(
            '!h-[64px] !text-[24px] [&>img]:!h-[42px] shadow-xl hover:shadow-2xl',
            buttonClassName,
          )}
        />
      </div>
      {footer}
    </div>
  );
}

interface PremiumCalculatorResultPanelProps {
  children: ReactNode;
  state?: 'empty' | 'populated';
  className?: string;
}

export function PremiumCalculatorResultPanel({
  children,
  state = 'populated',
  className,
}: PremiumCalculatorResultPanelProps) {
  const isEmpty = state === 'empty';

  return (
    <div
      className={cn(
        'lg:sticky lg:top-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 lg:p-10 text-white shadow-[0_20px_50px_rgba(15,23,42,0.5)] relative overflow-hidden',
        isEmpty
          ? 'flex flex-col min-h-[400px]'
          : 'animate-in fade-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none',
        className,
      )}
    >
      <div
        className={cn(
          'absolute -top-24 -right-24 w-64 h-64 bg-violet-500 rounded-full blur-3xl lg:blur-[100px] pointer-events-none',
          isEmpty ? 'opacity-20' : 'opacity-40',
        )}
      />
      <div
        className={cn(
          'absolute -bottom-24 -left-24 w-64 h-64 bg-sky-500 rounded-full blur-3xl lg:blur-[100px] pointer-events-none',
          isEmpty ? 'opacity-10' : 'opacity-30',
        )}
      />
      {children}
    </div>
  );
}

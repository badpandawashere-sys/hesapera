import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface FeaturedCalculatorCardProps {
  title: string;
  desc: string;
  category: string;
  icon: LucideIcon;
  badge: string;
  href: string;
  colorClass: string;
  bgClass: string;
  previewData: { label: string; value: string; valueClass?: string }[];
  resultLabel: string;
  resultValue: string;
  actionText: string;
}

export function FeaturedCalculatorCard({
  title,
  desc,
  category,
  icon: Icon,
  badge,
  href,
  colorClass,
  bgClass,
  previewData,
  resultLabel,
  resultValue,
  actionText
}: FeaturedCalculatorCardProps) {
  return (
    <div className="flex flex-col justify-between p-6 rounded-[24px] bg-[var(--color-glass-bg-strong)] backdrop-blur-[24px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-elevated)] hover:shadow-[0_16px_40px_rgba(124,58,237,0.12)] transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`px-2 py-1 rounded-md text-[11px] font-semibold bg-white/50 border border-black/5 ${colorClass}`}>
            {badge}
          </span>
          <div className={`p-2 rounded-xl bg-white/50 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#7C3AED] transition-colors">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 line-clamp-2">
          {desc}
        </p>

        {/* Mini Inputs Preview */}
        <div className="space-y-2 mb-6">
          {previewData.map((data, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/60 border border-white/40 flex justify-between items-center shadow-sm">
              <span className="text-[13px] text-slate-500 font-medium">{data.label}</span>
              <span className={`text-[13px] font-semibold ${data.valueClass || 'text-slate-700'}`}>{data.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Result Chip */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#F5F3FF]/80 to-[#EFF6FF]/80 border border-white/50 mb-4 flex items-center justify-between shadow-sm">
          <span className="text-[13px] font-medium text-slate-600">{resultLabel}</span>
          <span className={`text-xl font-bold tracking-tight ${colorClass}`}>{resultValue}</span>
        </div>
        <Link className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/80 hover:bg-white text-slate-800 text-[15px] font-semibold transition-colors shadow-sm border border-slate-200/50" href={href}>
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

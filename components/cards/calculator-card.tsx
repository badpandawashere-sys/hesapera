import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface CalculatorCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

export function CalculatorCard({ title, description, href, icon }: CalculatorCardProps) {
  return (
    <Link href={href} className="block group">
      <Card variant="glass-compact" className="h-full transition-all hover:shadow-[var(--shadow-glass-elevated)] hover:-translate-y-[2px] hover:border-white/90">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="bg-[#7C3AED]/10 text-[#7C3AED] p-3 rounded-xl shrink-0">
                {icon}
              </div>
            )}
            <div className="space-y-1.5 flex-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-1">{title}</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed line-clamp-2">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

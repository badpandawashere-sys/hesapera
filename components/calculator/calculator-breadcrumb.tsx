import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface CalculatorBreadcrumbProps {
  items: { label: string; href?: string }[];
}

export function CalculatorBreadcrumb({ items }: CalculatorBreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors shrink-0">
        <Home className="h-4 w-4" />
        <span className="sr-only">Ana Sayfa</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center shrink-0">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

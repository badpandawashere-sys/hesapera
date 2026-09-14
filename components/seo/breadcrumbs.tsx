import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { CalculatorCategory } from '@/calculators/core/calculator-types';
import { categories } from '@/lib/data/categories';

interface BreadcrumbsProps {
  category: CalculatorCategory;
  calculatorName: string;
  calculatorSlug: string;
}

export function Breadcrumbs({ category, calculatorName, calculatorSlug }: BreadcrumbsProps) {
  const uiCategoryId = CalculatorRegistry.getUiCategory(calculatorSlug, category);
  const catData = categories.find(c => c.id === uiCategoryId);
  const catName = catData?.name || 'Hesaplama';
  const catHref = `/kategoriler/${uiCategoryId}`;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors shrink-0">
        <Home className="h-4 w-4 mr-1" />
        <span>Ana Sayfa</span>
      </Link>
      
      <div className="flex items-center shrink-0">
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={catHref} className="hover:text-foreground transition-colors">
          {catName}
        </Link>
      </div>

      <div className="flex items-center shrink-0">
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-foreground">{calculatorName}</span>
      </div>
    </nav>
  );
}

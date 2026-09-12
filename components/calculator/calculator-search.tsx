'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calculator } from 'lucide-react';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init'; // populate registry on client side

// A simple hook for clicking outside to close
function useOnClickOutside(ref: React.RefObject<any>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function CalculatorSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(wrapperRef, () => setIsOpen(false));

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const q = query.toLocaleLowerCase('tr-TR').trim();
    const allCalculators = CalculatorRegistry.getAll();

    // Prioritize name matches, then description/category matches
    const exactMatches = [];
    const partialMatches = [];

    for (const calc of allCalculators) {
      const name = calc.name.toLocaleLowerCase('tr-TR');
      const desc = (calc.shortDescription || '').toLocaleLowerCase('tr-TR');
      const cat = (calc.category || '').toLocaleLowerCase('tr-TR');

      if (name.startsWith(q)) {
        exactMatches.push(calc);
      } else if (name.includes(q) || desc.includes(q) || cat.includes(q)) {
        partialMatches.push(calc);
      }
    }

    const combined = [...exactMatches, ...partialMatches].slice(0, 6);
    setResults(combined);
    setIsOpen(combined.length > 0);
    setSelectedIndex(-1);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        navigateToResult(results[selectedIndex].slug);
      } else if (results.length > 0) {
        // Default to first result if none selected but enter is pressed
        navigateToResult(results[0].slug);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const navigateToResult = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/hesaplama/${slug}`);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-primary">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Hesaplayıcı ara... (Örn: kredi, yüzde, yaş...)"
          className="w-full bg-surface-container-lowest border border-border/50 py-4 pl-12 pr-4 rounded-xl text-on-surface placeholder:text-outline font-body-lg text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
        />
        <div className="hidden sm:flex absolute right-4 items-center gap-1 px-2 py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-border">
          <span className="text-[10px]">ESC</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-2">
            {results.map((calc, index) => (
              <li key={calc.id}>
                <button
                  type="button"
                  onClick={() => navigateToResult(calc.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center text-left px-4 py-3 hover:bg-surface-container transition-colors ${
                    selectedIndex === index ? 'bg-surface-container-low' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-headline-sm text-[16px] text-on-surface truncate">{calc.name}</div>
                    <div className="font-body-sm text-[13px] text-on-surface-variant capitalize truncate">{calc.category}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

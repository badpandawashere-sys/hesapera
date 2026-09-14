import React from 'react';
import Link from 'next/link';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';

interface ContextualTextProps {
  text: string;
}

export function ContextualText({ text }: ContextualTextProps) {
  if (!text) return null;

  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, anchorText, url] = match;
    const startIndex = match.index;
    
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }
    
    if (url.startsWith('/hesaplama/')) {
      const slug = url.replace('/hesaplama/', '');
      const calc = CalculatorRegistry.getBySlug(slug);
      
      if (calc && calc.status === 'published') {
        parts.push(
          <Link 
            key={`link-${startIndex}`} 
            href={url}
            className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
          >
            {anchorText}
          </Link>
        );
      } else {
        // Draft or unknown calculator -> plain text
        parts.push(anchorText);
      }
    } else {
      // External or other path -> plain text
      parts.push(anchorText);
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Use a fragment so we don't inject extra wrapper elements
  return <>{parts.length > 0 ? parts : text}</>;
}

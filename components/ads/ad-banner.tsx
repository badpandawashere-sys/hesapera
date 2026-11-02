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

export function AdBanner(_props: AdBannerProps) {
  return null;
}

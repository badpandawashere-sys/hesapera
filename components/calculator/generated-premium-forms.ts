import type { ComponentType } from 'react';
import type { CalculatorViewModel } from '@/calculators/core/calculator-types';

// calculator-scaffold:premium-imports:start
import MsuForm from './msu-form';
// calculator-scaffold:premium-imports:end

export const generatedPremiumForms: Record<
  string,
  ComponentType<{ calculator: CalculatorViewModel }>
> = {
  // calculator-scaffold:premium-entries:start
  'msu-puan': MsuForm,
  // calculator-scaffold:premium-entries:end
};

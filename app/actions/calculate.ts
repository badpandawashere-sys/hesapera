'use server';

import { CalculatorEngine } from '@/calculators/core/calculator-engine';
import '@/calculators/core/init'; // Ensure registry is initialized
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { CalculatorContext } from '@/calculators/core/calculator-types';

export async function calculateAction(
  slug: string, 
  input: Record<string, any>,
  ctx?: CalculatorContext
): Promise<CalculatorResult<any, any>> {
  // Simulate network delay slightly for better UX (optional, but good for loading states)
  // await new Promise(resolve => setTimeout(resolve, 300));
  
  return CalculatorEngine.runBySlug(slug, input, ctx);
}

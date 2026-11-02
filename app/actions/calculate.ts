'use server';

import { CalculatorEngine } from '@/calculators/core/calculator-engine';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import '@/calculators/core/init'; // Ensure registry is initialized
import { CalculatorResult } from '@/calculators/core/calculator-result';
import { CalculatorContext } from '@/calculators/core/calculator-types';

export async function calculateAction(
  slug: string, 
  input: Record<string, any>,
  ctx?: CalculatorContext
): Promise<CalculatorResult<any, any>> {
  const calculator = CalculatorRegistry.getBySlug(slug);
  if (!calculator || calculator.status !== 'published') {
    return {
      success: false,
      errors: ['Bu hesaplama aracı henüz yayında değil veya bulunamadı.'],
    };
  }

  return CalculatorEngine.runBySlug(slug, input, ctx);
}

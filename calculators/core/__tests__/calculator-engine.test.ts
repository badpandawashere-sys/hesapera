import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorRegistry } from '../calculator-registry';
import { CalculatorEngine } from '../calculator-engine';
import { percentageCalculatorDef } from '../../definitions/percentage';
import { initializeCalculators } from '../init';
import { z } from 'zod';

describe('Calculator Engine & Registry', async () => {
  beforeEach(() => {
    // Reset and initialize registry before each test
    initializeCalculators();
  });

  it('1. should register and retrieve calculators successfully', async () => {
    const calcById = CalculatorRegistry.get('calc_percentage_001');
    const calcBySlug = CalculatorRegistry.getBySlug('yuzde');
    
    expect(calcById).toBeDefined();
    expect(calcBySlug).toBeDefined();
    expect(calcById?.id).toBe('calc_percentage_001');
    expect(calcBySlug?.id).toBe('calc_percentage_001');
  });

  it('2. should return error for unknown calculator lookup', async () => {
    const result = await CalculatorEngine.runBySlug('unknown-slug', { baseValue: 100 });
    
    expect(result.success).toBe(false);
    expect(result.errors).toContain("Calculator with slug 'unknown-slug' not found.");
  });

  it('3. should run validation and fail if input is invalid', async () => {
    // Missing percentage
    const result = await CalculatorEngine.runBySlug('yuzde', { baseValue: 100 });
    
    expect(result.success).toBe(false);
    
    expect(result.errors?.some(err => err.includes('percentage') || err.toLowerCase().includes('percentage'))).toBe(true);
    // Invalid type
    const result2 = await CalculatorEngine.runBySlug('yuzde', { baseValue: '100', percentage: 20 });
    expect(result2.success).toBe(false);
    expect(result2.errors?.some(err => err.includes('baseValue'))).toBe(true);
  });

  it('4. should calculate successfully with valid input', async () => {
    const result = await CalculatorEngine.runBySlug('yuzde', { baseValue: 500, percentage: 20 });
    
    expect(result.success).toBe(true);
    expect(result.data?.primaryResult).toBe(100);
    expect(result.errors).toBeUndefined();
  });

  it('5. should normalize result properly even if definition returns raw value', async () => {
    // We register a dummy calculator that just returns a number
    CalculatorRegistry.register({
      id: 'test_dummy',
      slug: 'test-dummy',
      name: 'Test Dummy',
      shortDescription: 'Dummy calc',
      category: 'other',
      type: 'simple',
      fields: [],
      metadata: { title: 'Test', description: 'Test' },
      schema: z.object({ val: z.number() }),
      calculate: (input) => input.val * 2
    });

    const result = await CalculatorEngine.runBySlug('test-dummy', { val: 21 });
    expect(result.success).toBe(true);
    expect(result.data?.primaryResult).toBe(42);
  });

  it('6. should catch and format unexpected errors during calculation', async () => {
    CalculatorRegistry.register({
      id: 'test_error',
      slug: 'test-error',
      name: 'Test Error',
      shortDescription: 'Error calc',
      category: 'other',
      type: 'simple',
      fields: [],
      metadata: { title: 'Test', description: 'Test' },
      schema: z.object({ val: z.number() }),
      calculate: () => {
        throw new Error("Simulated core failure");
      }
    });

    const result = await CalculatorEngine.runBySlug('test-error', { val: 1 });
    expect(result.success).toBe(false);
    expect(result.errors).toContain("Simulated core failure");
  });
});

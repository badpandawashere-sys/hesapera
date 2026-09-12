import { CalculatorRegistry } from './calculator-registry';
import { CalculatorResult } from './calculator-result';
import { CalculatorContext } from './calculator-types';

export class CalculatorEngine {
  static async runById(
    id: string,
    rawInput: unknown,
    ctx?: CalculatorContext
  ): Promise<CalculatorResult<any, any>> {
    const definition = CalculatorRegistry.get(id);
    if (!definition) {
      return {
        success: false,
        errors: [`Calculator with ID '${id}' not found.`],
      };
    }
    return this.execute(definition, rawInput, ctx);
  }

  static async runBySlug(
    slug: string,
    rawInput: unknown,
    ctx?: CalculatorContext
  ): Promise<CalculatorResult<any, any>> {
    const definition = CalculatorRegistry.getBySlug(slug);
    if (!definition) {
      return {
        success: false,
        errors: [`Calculator with slug '${slug}' not found.`],
      };
    }
    return this.execute(definition, rawInput, ctx);
  }

  private static async execute(
    definition: any,
    rawInput: unknown,
    ctx?: CalculatorContext
  ): Promise<CalculatorResult<any, any>> {
    try {
      const parsedInput = definition.schema.safeParse(rawInput);
      
      if (!parsedInput.success) {
        return {
          success: false,
          errors: parsedInput.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`),
        };
      }

      const rawResult = await definition.calculate(parsedInput.data, ctx);

      if (rawResult && typeof rawResult === 'object' && 'primaryResult' in rawResult) {
        return {
          success: true,
          data: rawResult,
        };
      }
      
      return {
        success: true,
        data: {
          primaryResult: rawResult,
        },
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || 'An unexpected error occurred during calculation.'],
      };
    }
  }
}

import { CalculatorDefinition } from './calculator-types';

class Registry {
  private calculators: Map<string, CalculatorDefinition<any, any>> = new Map();
  private slugMap: Map<string, string> = new Map();

  register(definition: CalculatorDefinition<any, any>): void {
    if (this.calculators.has(definition.id)) {
      throw new Error(`Calculator with ID ${definition.id} is already registered.`);
    }
    if (this.slugMap.has(definition.slug)) {
      throw new Error(`Calculator with slug ${definition.slug} is already registered.`);
    }
    
    this.calculators.set(definition.id, definition);
    this.slugMap.set(definition.slug, definition.id);
  }

  get(id: string): CalculatorDefinition<any, any> | undefined {
    return this.calculators.get(id);
  }

  getBySlug(slug: string): CalculatorDefinition<any, any> | undefined {
    const id = this.slugMap.get(slug);
    if (!id) return undefined;
    return this.calculators.get(id);
  }

  getByCategory(category: string): CalculatorDefinition<any, any>[] {
    return Array.from(this.calculators.values()).filter(
      (calc) => calc.category === category
    );
  }

  getAll(): CalculatorDefinition<any, any>[] {
    return Array.from(this.calculators.values());
  }

  has(id: string): boolean {
    return this.calculators.has(id);
  }
  
  clear(): void {
    this.calculators.clear();
    this.slugMap.clear();
  }
}

export const CalculatorRegistry = new Registry();

import { z } from 'zod';

export type CalculatorCategory = 
  | 'finance'
  | 'math'
  | 'health'
  | 'education'
  | 'conversion'
  | 'other';

export type CalculatorType = 'simple' | 'medium' | 'complex';

export type FieldType = 'number' | 'text' | 'select' | 'date' | 'checkbox' | 'currency' | 'percentage' | 'array';

export interface CalculatorFieldOption {
  label: string;
  value: string | number;
}

export interface FieldCondition {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'in';
  value: any;
}

export interface CalculatorField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  options?: CalculatorFieldOption[];
  description?: string;
  subFields?: CalculatorField[]; // Used when type is 'array'
  conditions?: FieldCondition[]; // Used for generic conditional field visibility
}

export interface CalculatorMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  faq?: Array<{ question: string; answer: string }>;
  relatedCalculators?: string[]; // array of slugs
  icon?: string; // name of the lucide icon, e.g. "CreditCard"
  features?: Array<{ label: string; icon?: string }>;
  infoBox?: {
    title: string;
    text: string;
    icon?: string;
  };
}

export type CalculatorInput = Record<string, any>;

export interface CalculatorContext {
  // Can be extended later with localization, user preferences, etc.
  locale?: string;
  currency?: string;
}

export interface CalculatorDefinition<TInput extends CalculatorInput = CalculatorInput, TResult = any> {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: CalculatorCategory;
  type: CalculatorType;
  fields: CalculatorField[];
  metadata: CalculatorMetadata;
  schema: z.ZodType<TInput>;
  calculate: (input: TInput, ctx?: CalculatorContext) => TResult | Promise<TResult>;
}

/**
 * Server-only calculator definitions must never cross the Server/Client boundary.
 * CalculatorViewModel is the client-safe, serializable representation of a calculator.
 */
export type CalculatorViewModel = Omit<CalculatorDefinition<any, any>, 'schema' | 'calculate'>;

/**
 * Strips non-serializable data (functions, class instances, schemas) from the CalculatorDefinition
 * so it can be safely passed to Client Components.
 */
export function calculatorToViewModel(def: CalculatorDefinition<any, any>): CalculatorViewModel {
  return {
    id: def.id,
    slug: def.slug,
    name: def.name,
    shortDescription: def.shortDescription,
    category: def.category,
    type: def.type,
    fields: def.fields,
    metadata: def.metadata,
  };
}

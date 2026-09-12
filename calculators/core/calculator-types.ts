
export interface CalculatorContentSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface CalculatorContentSource {
  name: string;
  url: string;
}

export interface CalculatorContent {
  intro: string;
  sections: CalculatorContentSection[];
  example?: {
    title: string;
    text: string;
  };
  sources?: CalculatorContentSource[];
}

﻿import { z } from 'zod';

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
  content?: CalculatorContent;
  relatedCalculators?: string[]; // array of slugs
  icon?: string; // name of the lucide icon, e.g. "CreditCard"
  features?: Array<{ label: string; icon?: string }>;
  locale?: string;
  currency?: string;
  infoBox?: any;
}

export interface CalculatorDefinition<TInput extends CalculatorInput = CalculatorInput, TResult = any> {
  status?: 'published' | 'draft';
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

export type CalculatorViewModel = Omit<CalculatorDefinition<any, any>, 'schema' | 'calculate'>;

export function calculatorToViewModel(def: CalculatorDefinition<any, any>): CalculatorViewModel {
  return {
    status: def.status || 'draft',
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

export type CalculatorInput = Record<string, any>;
export interface CalculatorContext {
  [key: string]: any;
}

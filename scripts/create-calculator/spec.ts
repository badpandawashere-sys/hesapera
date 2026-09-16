import type { CalculatorCategory, FieldType } from '../../calculators/core/calculator-types';

export type CalculatorScaffoldStatus = 'draft' | 'published';
export type CalculatorScaffoldUiMode = 'standard' | 'premium';

export interface CalculatorScaffoldInput {
  id: string;
  label: string;
  type: Extract<FieldType, 'number' | 'currency' | 'percentage'>;
  unit?: string;
  required: boolean;
  min: number;
  max: number;
  step?: number;
}

export interface CalculatorScaffoldOutput {
  id: string;
  label: string;
  unit?: string;
}

export interface CalculatorScaffoldFormula {
  identifier: string;
  assignments: Array<{
    outputId: string;
    expression: string;
  }>;
}

export interface CalculatorScaffoldContent {
  title: string;
  description: string;
  shortDescription: string;
  howItWorks: string[];
  guide: string[];
  example: {
    title: string;
    text: string;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CalculatorScaffoldSpec {
  slug: string;
  fileStem: string;
  name: string;
  category: CalculatorCategory;
  uiCategory: string;
  status: CalculatorScaffoldStatus;
  inputs: CalculatorScaffoldInput[];
  outputs: CalculatorScaffoldOutput[];
  validationLimits: Record<string, { min: number; max: number }>;
  formula: CalculatorScaffoldFormula;
  uiMode: CalculatorScaffoldUiMode;
  relatedCalculatorSlugs: string[];
  content: CalculatorScaffoldContent;
}

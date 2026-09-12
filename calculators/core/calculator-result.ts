export interface CalculatorWarning {
  fieldId?: string;
  message: string;
}

export interface CategoryRange {
  label: string;
  min?: number;
  max?: number;
  color?: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'dark-red' | string;
}

export interface RangeIndicatorData {
  currentValue: number;
  ranges: CategoryRange[];
  statusMessage?: string;
  statusColor?: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'dark-red' | string;
}

export interface InfoReferenceData {
  title: string;
  description: string;
}

export interface CalculatorResultData<TPrimary = number | string, TSecondary = Record<string, any>> {
  primaryLabel?: string; // Optional custom label for the primary result
  primaryResult: TPrimary;
  secondaryResults?: TSecondary;
  breakdown?: Array<{ label: string; value: string | number }>;
  table?: Array<Record<string, string | number>>;
  chartData?: Array<Record<string, string | number>>;
  categoryIndicator?: RangeIndicatorData;
  infoReference?: InfoReferenceData;
}

export interface CalculatorResult<TPrimary = number | string, TSecondary = Record<string, any>> {
  success: boolean;
  data?: CalculatorResultData<TPrimary, TSecondary>;
  errors?: string[];
  warnings?: CalculatorWarning[];
  notes?: string[];
}

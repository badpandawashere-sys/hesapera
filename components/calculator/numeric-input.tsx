import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Input } from '@/components/ui/input';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number | string | null;
  onValueChange?: (val: number | string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isInteger?: boolean;
  error?: string | boolean;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(({
  id, value, onValueChange, onChange, placeholder, className, error, isInteger, ...props
}, forwardedRef) => {
  const [displayValue, setDisplayValue] = useState('');
  const internalRef = useRef<HTMLInputElement>(null);
  
  // Use either the forwarded ref or the internal ref
  const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

  const parseDisplay = (str: string): number | null => {
    if (!str || str === '-') return null;
    const normalized = str.replace(/\./g, '').replace(/,/g, '.');
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  };

  const formatNumber = (numericStr: string): string => {
    if (!numericStr) return '';
    const isNeg = numericStr.startsWith('-');
    const abs = numericStr.replace(/^-/, '');
    const [intPart, decPart] = abs.split(',');
    
    let cleanInt = intPart || '';
    cleanInt = cleanInt.replace(/^0+(?=\d)/, '');
    
    if (cleanInt === '' && decPart !== undefined) {
      cleanInt = '0';
    }
    
    const formattedInt = cleanInt.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const full = isNeg ? '-' + formattedInt : formattedInt;
    return decPart !== undefined ? full + ',' + decPart : full;
  };

  useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      if (displayValue !== '-') {
        setDisplayValue('');
      }
      return;
    }
    const current = parseDisplay(displayValue);
    // Be careful here: `value` could be a string if it comes from an unparsed state.
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (current === numValue && !isNaN(numValue)) return;
    
    const s = numValue.toString().replace('.', ',');
    setDisplayValue(formatNumber(s));
  }, [value]);

  const fireChange = (parsed: number | null, formatted: string) => {
    const valForChange = parsed === null ? '' : parsed;
    
    if (onValueChange) {
      onValueChange(valForChange);
    }
    if (onChange) {
      const e = {
        target: {
          value: parsed === null ? '' : parsed.toString(),
          name: props.name,
          id: id,
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    let cursor = input.selectionStart ?? 0;
    let raw = input.value;

    if (raw === '-') {
      setDisplayValue('-');
      fireChange(null, '-');
      return;
    }

    if (raw.length === displayValue.length + 1 && raw[cursor - 1] === '.') {
      raw = raw.substring(0, cursor - 1) + ',' + raw.substring(cursor);
    } 
    else if (raw.length > displayValue.length + 1) {
      const commaCount = (raw.match(/,/g) || []).length;
      const dotCount = (raw.match(/\./g) || []).length;
      if (commaCount === 0 && dotCount === 1) {
        raw = raw.replace('.', ',');
      }
    }

    const dotsBeforeCursor = (raw.substring(0, cursor).match(/\./g) || []).length;
    const stripped = raw.replace(/\./g, '');
    const cursorInStripped = Math.max(0, cursor - dotsBeforeCursor);

    let cleaned = stripped.replace(/[^0-9,-]/g, '');

    const firstComma = cleaned.indexOf(',');
    if (firstComma !== -1) {
      const before = cleaned.substring(0, firstComma + 1);
      const after = cleaned.substring(firstComma + 1).replace(/,/g, '');
      cleaned = before + after;
    }

    if (cleaned.startsWith(',')) {
      cleaned = '0' + cleaned;
    } else if (cleaned.startsWith('-,')) {
      cleaned = '-0,' + cleaned.substring(2);
    }

    const formatted = formatNumber(cleaned);
    setDisplayValue(formatted);

    let cleanLeft = stripped.substring(0, cursorInStripped).replace(/[^0-9,-]/g, '');
    if (cleanLeft.startsWith(',')) {
      cleanLeft = '0' + cleanLeft;
    } else if (cleanLeft.startsWith('-,')) {
      cleanLeft = '-0,' + cleanLeft.substring(2);
    }

    let newCursor = 0;
    let counted = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (counted === cleanLeft.length) {
        newCursor = i;
        break;
      }
      if (formatted[i] !== '.') {
        counted++;
      }
      newCursor = i + 1;
    }
    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    });

    if (!formatted || formatted === '-') {
      fireChange(null, formatted);
    } else {
      const parsed = parseDisplay(formatted);
      if (parsed !== null) {
        fireChange(parsed, formatted);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (displayValue && displayValue !== '-') {
      const parsed = parseDisplay(displayValue);
      if (parsed !== null) {
        const s = parsed.toString().replace('.', ',');
        setDisplayValue(formatNumber(s));
      }
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      inputMode={isInteger ? "numeric" : "decimal"}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  );
});

NumericInput.displayName = 'NumericInput';

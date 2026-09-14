import React, { useState, useEffect, useRef } from 'react';
import { CalculatorField } from '@/calculators/core/calculator-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

// Türkçe lokale: binlik ayırıcı = nokta (.), ondalık ayırıcı = virgül (,)
// Örnek: 1.000.000,50

function FormattedNumberInput({ id, value, onChange, placeholder, className, error, isInteger }: any) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // "1.234,56" → 1234.56
  const parseDisplay = (str: string): number | null => {
    if (!str || str === '-') return null;
    const normalized = str.replace(/\./g, '').replace(/,/g, '.');
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  };

  // "1234.56" veya "1234" → "1.234,56" veya "1.234"
  const formatNumber = (numericStr: string): string => {
    if (!numericStr) return '';
    const isNeg = numericStr.startsWith('-');
    const abs = numericStr.replace(/^-/, '');
    const [intPart, decPart] = abs.split(',');
    const formattedInt = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const full = isNeg ? '-' + formattedInt : formattedInt;
    return decPart !== undefined ? full + ',' + decPart : full;
  };

  // Dışarıdan gelen numeric value değişince displayValue'yu güncelle
  useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      // Kullanıcı '-' yazıp daha devam ediyorsa silme
      if (displayValue !== '-') {
        setDisplayValue('');
      }
      return;
    }
    // Şu anda gösterilen numeric değer ile dışarıdan gelen aynıysa dokunma
    const current = parseDisplay(displayValue);
    if (current === value) return;
    // Farklıysa (örn. programatic reset), yeniden formatla
    const s = (value as number).toString().replace('.', ',');
    setDisplayValue(formatNumber(s));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursor = input.selectionStart ?? 0;
    const raw = input.value;

    // Sadece '-' girilmişse bekle
    if (raw === '-') {
      setDisplayValue('-');
      onChange('');
      return;
    }

    // 1) Binlik ayırıcı noktaları sil (Türkçe formatta '.' her zaman binlik)
    //    İmleç konumunu da düzelt
    const dotsBeforeCursor = (raw.substring(0, cursor).match(/\./g) || []).length;
    const stripped = raw.replace(/\./g, '');
    const cursorInStripped = Math.max(0, cursor - dotsBeforeCursor);

    // 2) İzin verilen karakterler: rakam, eksi, virgül
    let cleaned = stripped.replace(/[^0-9,-]/g, '');

    // 3) Birden fazla virgülü temizle (ilk virgül = ondalık ayırıcı)
    const firstComma = cleaned.indexOf(',');
    if (firstComma !== -1) {
      const before = cleaned.substring(0, firstComma + 1);
      const after = cleaned.substring(firstComma + 1).replace(/,/g, '');
      cleaned = before + after;
    }

    // 4) Formatla
    const formatted = formatNumber(cleaned);
    setDisplayValue(formatted);

    // 5) İmleç pozisyonunu yeni formatlı string'de bul
    //    Temizlenmiş string'deki sol karakter sayısını hesapla
    const cleanLeft = stripped.substring(0, cursorInStripped).replace(/[^0-9,-]/g, '');
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

    // 6) Motora numeric value gönder
    if (!formatted || formatted === '-') {
      onChange('');
    } else {
      const parsed = parseDisplay(formatted);
      if (parsed !== null) {
        onChange(parsed);
      }
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
      placeholder={placeholder}
      className={className}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  );
}

interface CalculatorFieldProps {
  field: CalculatorField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function CalculatorFieldComponent({ field, value, onChange, error }: CalculatorFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val: any = e.target.value;
    onChange(val);
  };

  const id = `field-${field.id}`;

  let displayLabel = field.label;
  let unit = null;

  if (field.type === 'number') {
    const unitMatch = field.label.match(/\(([^)]+)\)$/);
    if (unitMatch) {
      unit = unitMatch[1];
      displayLabel = field.label.replace(/\([^)]+\)$/, '').trim();
    }
  }

  const isNumericField = field.type === 'number' || field.type === 'currency' || field.type === 'percentage';

  // Sınıflandırma Mantığı (Tam sayı mı?)
  // Yalnızca kesin olan (step bilgisi 1 olan type='number') alanları tam sayı (numeric klavye) kabul et.
  const isInteger = field.type === 'number' && field.step === 1;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={`text-sm font-semibold ${error ? "text-destructive" : "text-foreground"}`}>
        {displayLabel} {field.required && <span className="text-destructive">*</span>}
      </Label>

      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}

      {field.type === 'text' || field.type === 'date' || isNumericField ? (
        <div className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${error ? 'border-destructive focus-within:ring-destructive/20 focus-within:border-destructive' : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'}`}>
          {field.type === 'currency' && (
            <div className="flex items-center pl-4 pr-1 text-muted-foreground font-medium text-sm select-none">₺</div>
          )}
          {field.type === 'percentage' && (
            <div className="flex items-center pl-4 pr-1 text-muted-foreground font-medium text-sm select-none">%</div>
          )}

          {isNumericField ? (
            <FormattedNumberInput
              id={id}
              value={value}
              onChange={onChange}
              placeholder={field.placeholder}
              className={`border-0 focus-visible:ring-0 shadow-none h-12 text-base rounded-none ${error ? 'text-destructive' : ''}`}
              error={error}
              isInteger={isInteger}
            />
          ) : (
            <Input
              id={id}
              type={field.type === 'text' ? 'text' : 'date'}
              value={value ?? ''}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={`border-0 focus-visible:ring-0 shadow-none h-12 text-base rounded-none ${error ? 'text-destructive' : ''}`}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
          )}

          {unit && (
            <div className="flex items-center px-4 bg-muted/20 border-l border-input text-muted-foreground font-medium text-sm select-none">
              {unit}
            </div>
          )}
        </div>
      ) : null}

      {field.type === 'select' && (
        <Select value={value?.toString() || ''} onValueChange={onChange}>
          <SelectTrigger id={id} className={error ? 'border-destructive focus:ring-destructive' : ''} aria-invalid={!!error}>
            <SelectValue placeholder={field.placeholder || 'Seçiniz'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'checkbox' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={id}
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
            aria-invalid={!!error}
          />
          <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
            {field.placeholder || field.label}
          </Label>
        </div>
      )}

      {field.type === 'array' && (
        <div className="space-y-4 border rounded-xl p-4 bg-muted/20">
          {(!value || value.length === 0) ? (
            <div className="text-sm text-muted-foreground italic">Henüz satır eklenmedi.</div>
          ) : (
            (value || []).map((item: any, index: number) => (
              <div key={index} className="flex gap-4 items-start relative border-b pb-4 last:border-0 last:pb-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field.subFields?.map(subField => (
                    <CalculatorFieldComponent
                      key={subField.id}
                      field={subField}
                      value={item?.[subField.id]}
                      onChange={(newVal) => {
                        const newArray = [...(value || [])];
                        if (!newArray[index]) newArray[index] = {};
                        newArray[index] = { ...newArray[index], [subField.id]: newVal };
                        onChange(newArray);
                      }}
                      error={error && typeof error === 'object' ? (error as any)[index]?.[subField.id] : undefined}
                    />
                  ))}
                </div>
                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive mt-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                  const newArray = [...(value || [])];
                  newArray.splice(index, 1);
                  onChange(newArray);
                }}>
                   <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const newArray = [...(value || [])];
            newArray.push({});
            onChange(newArray);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Satır Ekle
          </Button>
        </div>
      )}

      {error && typeof error === 'string' && (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

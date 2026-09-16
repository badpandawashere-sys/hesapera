import type { CalculatorResultData } from '../core/calculator-result';

// Shared by definition fields, Zod validation and pure functions.
export const YAKIT_TUKETIMI_LIMITS = {
  paidAmount: 100_000, budget: 100_000, distance: 100_000,
  fuelPrice: 1_000, costPerKm: 1_000,
} as const;

export type YakitTuketimiMod = 'A' | 'B' | 'C';

export interface YakitTuketimiResult extends CalculatorResultData<string, Record<string, string>> {
  mod: YakitTuketimiMod;
  tlPerKm: number;
  tlPer100Km?: number;
  liters?: number;
  litersPer100Km?: number;
  distance?: number;
  totalCost?: number;
  primaryLabel: string;
  secondaryResults: Record<string, string>;
  breakdown: Array<{ label: string; value: string | number }>;
}

function assertInput(value: number, field: keyof typeof YAKIT_TUKETIMI_LIMITS): void {
  if (!Number.isFinite(value) || value <= 0 || value > YAKIT_TUKETIMI_LIMITS[field]) {
    throw new Error(`${field}: Değer sonlu, 0'dan büyük ve en fazla ${YAKIT_TUKETIMI_LIMITS[field]} olmalıdır.`);
  }
}

// Finite inputs can still overflow or underflow during arithmetic.
function checked(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Değerler hesaplanabilir sayı aralığının dışında.');
  }
  return value;
}

const fmt = (value: number) => new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);

/** A: amount / distance → TL/km; optional fuel price adds litre results. */
export function calcModA(paidAmount: number, distance: number, fuelPrice?: number): YakitTuketimiResult {
  assertInput(paidAmount, 'paidAmount');
  assertInput(distance, 'distance');
  if (fuelPrice !== undefined) assertInput(fuelPrice, 'fuelPrice');
  const tlPerKm = checked(paidAmount / distance);
  const tlPer100Km = checked(tlPerKm * 100);
  const liters = fuelPrice === undefined ? undefined : checked(paidAmount / fuelPrice);
  const litersPer100Km = liters === undefined ? undefined : checked((liters / distance) * 100);
  const secondaryResults: Record<string, string> = {
    '100 km Maliyeti': `${fmt(tlPer100Km)} TL / 100 km`,
    'Ödenen Tutar': `${fmt(paidAmount)} TL`,
  };
  const breakdown = [
    { label: 'Ödenen Yakıt Tutarı', value: `${fmt(paidAmount)} TL` },
    { label: 'Gidilen Mesafe', value: `${fmt(distance)} km` },
    { label: 'Km Başına Maliyet', value: `${fmt(tlPerKm)} TL / km` },
    { label: '100 km Maliyeti', value: `${fmt(tlPer100Km)} TL / 100 km` },
  ];
  if (fuelPrice !== undefined && liters !== undefined && litersPer100Km !== undefined) {
    secondaryResults['Alınan Yakıt'] = `${fmt(liters)} L`;
    secondaryResults['100 km Yakıt Tüketimi'] = `${fmt(litersPer100Km)} L / 100 km`;
    breakdown.push(
      { label: 'Yakıt Litre Fiyatı', value: `${fmt(fuelPrice)} TL / L` },
      { label: 'Alınan Yakıt', value: `${fmt(liters)} L` },
      { label: '100 km Yakıt Tüketimi', value: `${fmt(litersPer100Km)} L / 100 km` },
    );
  }
  return {
    mod: 'A', tlPerKm, tlPer100Km, liters, litersPer100Km,
    primaryLabel: 'Km Başına Maliyet',
    primaryResult: `${fmt(tlPerKm)} TL / km`,
    secondaryResults, breakdown,
    infoReference: {
      title: 'Maliyet Nasıl Hesaplandı?',
      description: 'Ödenen tutar mesafeye bölünerek TL/km bulunur; 100 ile çarpılarak TL/100 km hesaplanır. Litre fiyatı girilmişse tutar litre fiyatına bölünür; bulunan litre mesafeye bölünüp 100 ile çarpılır. Gerçek tüketim için aynı dolum seviyeleri arasında ölçüm yapın.',
    },
  };
}

/** B: budget / costPerKm → km. */
export function calcModB(budget: number, costPerKm: number): YakitTuketimiResult {
  assertInput(budget, 'budget');
  assertInput(costPerKm, 'costPerKm');
  const distance = checked(budget / costPerKm);
  return {
    mod: 'B', tlPerKm: costPerKm, distance,
    primaryLabel: 'Gidebileceğiniz Mesafe',
    primaryResult: `${fmt(distance)} km`,
    secondaryResults: {
      'Ortalama Maliyet': `${fmt(costPerKm)} TL / km`,
      'Yakıt Bütçesi': `${fmt(budget)} TL`,
    },
    breakdown: [
      { label: 'Yakıt Bütçesi', value: `${fmt(budget)} TL` },
      { label: 'Ortalama Maliyet', value: `${fmt(costPerKm)} TL / km` },
      { label: 'Gidebileceğiniz Mesafe', value: `${fmt(distance)} km` },
    ],
    infoReference: {
      title: 'Mesafe Nasıl Hesaplandı?',
      description: 'Yakıt bütçesi (TL), kilometre başına ortalama maliyete (TL/km) bölünerek gidilebilecek mesafe (km) bulunur.',
    },
  };
}

/** C: distance * costPerKm → TL. */
export function calcModC(distance: number, costPerKm: number): YakitTuketimiResult {
  assertInput(distance, 'distance');
  assertInput(costPerKm, 'costPerKm');
  const totalCost = checked(distance * costPerKm);
  return {
    mod: 'C', tlPerKm: costPerKm, totalCost,
    primaryLabel: 'Toplam Yakıt Maliyeti',
    primaryResult: `${fmt(totalCost)} TL`,
    secondaryResults: {
      'Ortalama Maliyet': `${fmt(costPerKm)} TL / km`,
      'Mesafe': `${fmt(distance)} km`,
    },
    breakdown: [
      { label: 'Gidilecek Mesafe', value: `${fmt(distance)} km` },
      { label: 'Ortalama Maliyet', value: `${fmt(costPerKm)} TL / km` },
      { label: 'Toplam Yakıt Maliyeti', value: `${fmt(totalCost)} TL` },
    ],
    infoReference: {
      title: 'Maliyet Nasıl Hesaplandı?',
      description: 'Mesafe (km), kilometre başına ortalama maliyet (TL/km) ile çarpılarak toplam yakıt maliyeti (TL) bulunur.',
    },
  };
}

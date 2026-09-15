export interface YakitMaliyetiResult {
  totalLiters: number;
  totalCost: number;
  costPerKm: number;
  primaryLabel: string;
  primaryResult: string;
  secondaryResults: Record<string, string>;
  breakdown: Array<{ label: string; value: string | number }>;
  infoReference?: {
    title: string;
    description: string;
  };
}

export function calculateYakitMaliyeti(
  distance: number,
  fuelConsumption: number,
  fuelPrice: number
): YakitMaliyetiResult {
  if (
    typeof distance !== 'number' || isNaN(distance) || !isFinite(distance) || distance <= 0 ||
    typeof fuelConsumption !== 'number' || isNaN(fuelConsumption) || !isFinite(fuelConsumption) || fuelConsumption <= 0 ||
    typeof fuelPrice !== 'number' || isNaN(fuelPrice) || !isFinite(fuelPrice) || fuelPrice <= 0
  ) {
    throw new Error('Geçersiz, sıfır veya negatif değer girildi. Mesafe, tüketim ve litre fiyatı 0\'dan büyük olmalıdır.');
  }

  // Yakıt miktarı: mesafe × tüketim / 100
  const totalLiters = (distance * fuelConsumption) / 100;

  // Toplam yakıt maliyeti: yakıt miktarı × litre fiyatı
  const totalCost = totalLiters * fuelPrice;

  // Kilometre başına maliyet: toplam maliyet / mesafe
  const costPerKm = totalCost / distance;

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  const fmtNumber = (v: number) =>
    new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return {
    totalLiters,
    totalCost,
    costPerKm,
    primaryLabel: 'Toplam Yakıt Maliyeti',
    primaryResult: `${fmtCurrency(totalCost)} TL`,
    secondaryResults: {
      'Tüketilen Yakıt': `${fmtNumber(totalLiters)} Litre`,
      'Kilometre Başı Maliyet': `${fmtCurrency(costPerKm)} TL / km`,
      'Toplam Mesafe': `${fmtNumber(distance)} km`,
      'Yakıt Litre Fiyatı': `${fmtCurrency(fuelPrice)} TL / L`
    },
    breakdown: [
      { label: 'Yolculuk Mesafesi', value: `${fmtNumber(distance)} km` },
      { label: '100 km Ortalama Tüketim', value: `${fmtNumber(fuelConsumption)} L` },
      { label: 'Yakıt Litre Fiyatı', value: `${fmtCurrency(fuelPrice)} TL` },
      { label: 'Toplam Tüketilen Yakıt', value: `${fmtNumber(totalLiters)} Litre` },
      { label: 'Kilometre Başına Maliyet', value: `${fmtCurrency(costPerKm)} TL / km` },
      { label: 'Toplam Yakıt Maliyeti', value: `${fmtCurrency(totalCost)} TL` }
    ],
    infoReference: {
      title: 'Yakıt Maliyeti Nasıl Hesaplanır?',
      description: 'Toplam yakıt sarfiyatı; gidilecek mesafe ile aracın 100 km\'deki ortalama tüketim değerinin çarpılıp 100\'e bölünmesiyle hesaplanır. Elde edilen litre miktarı girdiğiniz pompa litre fiyatı ile çarpılarak toplam seyahat masrafı ve km başına düşen maliyet bulunur.'
    }
  };
}

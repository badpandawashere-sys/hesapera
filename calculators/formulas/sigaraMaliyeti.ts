export interface SigaraMaliyetiInput {
  gunlukAdet: number;
  paketFiyati: number;
  pakettekiAdet?: number;
}

export function calculateSigaraMaliyeti(inputs: SigaraMaliyetiInput) {
  const { gunlukAdet, paketFiyati, pakettekiAdet = 20 } = inputs;

  if (gunlukAdet <= 0) throw new Error("Lütfen geçerli bir günlük adet giriniz.");
  if (paketFiyati <= 0) throw new Error("Lütfen geçerli bir paket fiyatı giriniz.");
  if (pakettekiAdet <= 0) throw new Error("Paketteki adet 0'dan büyük olmalıdır.");

  const packsPerDay = gunlukAdet / pakettekiAdet;
  const dailyCost = packsPerDay * paketFiyati;
  const monthlyCost = dailyCost * 30; // 30 gün
  const yearlyCost = dailyCost * 365; // 365 gün
  const fiveYearCost = yearlyCost * 5;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  return {
    primaryResult: `${formatCurrency(monthlyCost)} / Ay`,
    secondaryResults: {
      "Günlük Maliyet": formatCurrency(dailyCost),
      "Yıllık Maliyet": formatCurrency(yearlyCost),
      "5 Yıllık Maliyet": formatCurrency(fiveYearCost)
    },
    notes: [
      "Bu araç tamamen matematiksel maliyet tahminidir.",
      "Aylık maliyet 30 gün, yıllık maliyet 365 gün üzerinden hesaplanmıştır.",
      "Bu hesaplama harcamalarınızı gösterir; herhangi bir tıbbi risk değerlendirmesi içermez."
    ]
  };
}

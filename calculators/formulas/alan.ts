export interface AlanInput {
  sekil: 'Kare' | 'Dikdörtgen' | 'Üçgen' | 'Paralelkenar' | 'Yamuk' | 'Daire' | 'Elips';
  birim: 'cm' | 'm' | 'mm';
  kenarA?: number;
  kenarB?: number;
  taban?: number;
  ustTaban?: number;
  yukseklik?: number;
  yaricap?: number;
  buyukYaricap?: number;
  kucukYaricap?: number;
}

export function calculateAlan(inputs: AlanInput) {
  const { sekil, birim, kenarA, kenarB, taban, ustTaban, yukseklik, yaricap, buyukYaricap, kucukYaricap } = inputs;
  let alan = 0;
  let formulu = "";

  const ensurePositive = (val: number | undefined, ad: string) => {
    if (val === undefined || isNaN(val) || val <= 0) throw new Error(`${ad} 0'dan büyük olmalıdır.`);
  };

  const formatNumber = (val: number, maxDecimals: number = 4) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: maxDecimals }).format(val);

  if (sekil === 'Kare') {
    ensurePositive(kenarA, "Kenar");
    alan = kenarA! * kenarA!;
    formulu = "A = a²";
  } else if (sekil === 'Dikdörtgen') {
    ensurePositive(kenarA, "Kısa Kenar");
    ensurePositive(kenarB, "Uzun Kenar");
    alan = kenarA! * kenarB!;
    formulu = "A = a × b";
  } else if (sekil === 'Üçgen') {
    ensurePositive(taban, "Taban");
    ensurePositive(yukseklik, "Yükseklik");
    alan = (taban! * yukseklik!) / 2;
    formulu = "A = (taban × yükseklik) / 2";
  } else if (sekil === 'Paralelkenar') {
    ensurePositive(taban, "Taban");
    ensurePositive(yukseklik, "Yükseklik");
    alan = taban! * yukseklik!;
    formulu = "A = taban × yükseklik";
  } else if (sekil === 'Yamuk') {
    ensurePositive(taban, "Alt Taban");
    ensurePositive(ustTaban, "Üst Taban");
    ensurePositive(yukseklik, "Yükseklik");
    alan = ((taban! + ustTaban!) * yukseklik!) / 2;
    formulu = "A = ((a + b) × h) / 2";
  } else if (sekil === 'Daire') {
    ensurePositive(yaricap, "Yarıçap");
    alan = Math.PI * yaricap! * yaricap!;
    formulu = "A = π × r²";
  } else if (sekil === 'Elips') {
    ensurePositive(buyukYaricap, "Büyük Yarıçap");
    ensurePositive(kucukYaricap, "Küçük Yarıçap");
    alan = Math.PI * buyukYaricap! * kucukYaricap!;
    formulu = "A = π × a × b";
  }

  const formatAlan = formatNumber(alan);
  const formatBirim = `${birim}²`;

  return {
    primaryResult: `${formatAlan} ${formatBirim}`,
    secondaryResults: {
      "Seçilen Şekil": sekil,
      "Alan": `${formatAlan} ${formatBirim}`,
      "Kullanılan Formül": formulu
    },
    notes: [
      "Alan hesaplamaları, tüm ölçülerin seçilen standart birimde (cm, m, mm) girildiği varsayılarak yapılır.",
      "Sonuç, girilen birimin karesi (kare birim) cinsinden elde edilir."
    ]
  };
}

export interface AlanInput {
  sekil: 'Kare' | 'Dikdörtgen' | 'Üçgen' | 'Daire' | 'Paralelkenar' | 'Yamuk';
  birim: 'cm' | 'm' | 'mm';
  kenarA?: number;
  kenarB?: number;
  yukseklik?: number;
  yaricap?: number;
  taban?: number;
  ustTaban?: number;
}

export function calculateAlan(inputs: AlanInput) {
  const { sekil, birim, kenarA = 0, kenarB = 0, yukseklik = 0, yaricap = 0, taban = 0, ustTaban = 0 } = inputs;
  let alan = 0;
  let formulu = "";

  const ensurePositive = (val: number, ad: string) => {
    if (val <= 0) throw new Error(`${ad} 0'dan büyük olmalıdır.`);
  };

  if (sekil === 'Kare') {
    ensurePositive(kenarA, "Kenar");
    alan = kenarA * kenarA;
    formulu = "A = a²";
  } else if (sekil === 'Dikdörtgen') {
    ensurePositive(kenarA, "Kısa Kenar");
    ensurePositive(kenarB, "Uzun Kenar");
    alan = kenarA * kenarB;
    formulu = "A = a × b";
  } else if (sekil === 'Üçgen') {
    ensurePositive(taban, "Taban");
    ensurePositive(yukseklik, "Yükseklik");
    alan = (taban * yukseklik) / 2;
    formulu = "A = (taban × yükseklik) / 2";
  } else if (sekil === 'Daire') {
    ensurePositive(yaricap, "Yarıçap");
    alan = Math.PI * yaricap * yaricap;
    formulu = "A = π × r²";
  } else if (sekil === 'Paralelkenar') {
    ensurePositive(taban, "Taban");
    ensurePositive(yukseklik, "Yükseklik");
    alan = taban * yukseklik;
    formulu = "A = taban × yükseklik";
  } else if (sekil === 'Yamuk') {
    ensurePositive(taban, "Alt Taban");
    ensurePositive(ustTaban, "Üst Taban");
    ensurePositive(yukseklik, "Yükseklik");
    alan = ((taban + ustTaban) * yukseklik) / 2;
    formulu = "A = ((a + b) × h) / 2";
  }

  // Yuvarlama işlemi: virgülden sonra maks 4 hane, gereksiz sıfırları atarak
  const formatAlan = Number.isInteger(alan) ? alan.toString() : alan.toFixed(4).replace(/\.?0+$/, '');
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

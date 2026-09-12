export interface PerimeterInput {
  sekil: 'Kare' | 'Dikdörtgen' | 'Üçgen' | 'Paralelkenar' | 'Yamuk' | 'Daire';
  birim: 'cm' | 'm' | 'mm';
  kenarA?: number;
  kenarB?: number;
  kenarC?: number;
  kenarD?: number;
  yaricap?: number;
}

export function calculatePerimeter(inputs: PerimeterInput) {
  const { sekil, birim, kenarA, kenarB, kenarC, kenarD, yaricap } = inputs;
  let cevre = 0;
  let formulu = "";

  const ensurePositive = (val: number | undefined, ad: string) => {
    if (val === undefined || isNaN(val) || val <= 0) throw new Error(`${ad} 0'dan büyük olmalıdır.`);
  };

  const formatNumber = (val: number, maxDecimals: number = 4) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: maxDecimals }).format(val);

  if (sekil === 'Kare') {
    ensurePositive(kenarA, "Kenar");
    cevre = 4 * kenarA!;
    formulu = "Ç = 4 × a";
  } else if (sekil === 'Dikdörtgen' || sekil === 'Paralelkenar') {
    ensurePositive(kenarA, "1. Kenar / Taban");
    ensurePositive(kenarB, "2. Kenar / Yan Kenar");
    cevre = 2 * (kenarA! + kenarB!);
    formulu = "Ç = 2 × (a + b)";
  } else if (sekil === 'Üçgen') {
    ensurePositive(kenarA, "1. Kenar");
    ensurePositive(kenarB, "2. Kenar");
    ensurePositive(kenarC, "3. Kenar");
  
    const a = kenarA!;
    const b = kenarB!;
    const c = kenarC!;
  
    if (a + b <= c || a + c <= b || b + c <= a) {
      throw new Error("Geçersiz üçgen: Herhangi iki kenarın toplamı üçüncü kenardan büyük olmalıdır.");
    }
  
    cevre = a + b + c;
    formulu = "Ç = a + b + c";
  } else if (sekil === 'Yamuk') {
    ensurePositive(kenarA, "Alt Taban");
    ensurePositive(kenarB, "Üst Taban");
    ensurePositive(kenarC, "1. Yan Kenar");
    ensurePositive(kenarD, "2. Yan Kenar");
    cevre = kenarA! + kenarB! + kenarC! + kenarD!;
    formulu = "Ç = a + b + c + d";
  } else if (sekil === 'Daire') {
    ensurePositive(yaricap, "Yarıçap");
    cevre = 2 * Math.PI * yaricap!;
    formulu = "Ç = 2 × π × r";
  }

  const formatCevre = formatNumber(cevre);

  return {
    primaryResult: `${formatCevre} ${birim}`,
    secondaryResults: {
      "Seçilen Şekil": sekil,
      "Çevre Uzunluğu": `${formatCevre} ${birim}`,
      "Kullanılan Formül": formulu
    },
    notes: [
      "Çevre hesaplamaları, tüm ölçülerin seçilen standart birimde (cm, m, mm) girildiği varsayılarak yapılır."
    ]
  };
}

export const MTV_TAX_YEAR = 2026;

type AgeBand = readonly [number, number, number, number, number];

interface CurrentTariffRow {
  engineMin: number;
  engineMax: number;
  valueMax?: number;
  annualByAge: AgeBand;
}

// GİB 58 Seri No'lu MTV Genel Tebliği, 2026 yılı tarifesi.
const CURRENT_ROWS: readonly CurrentTariffRow[] = [
  { engineMin: 0, engineMax: 1300, valueMax: 309100, annualByAge: [5750, 4010, 2238, 1689, 593] },
  { engineMin: 0, engineMax: 1300, valueMax: 541500, annualByAge: [6319, 4409, 2459, 1861, 655] },
  { engineMin: 0, engineMax: 1300, annualByAge: [6902, 4807, 2693, 2032, 706] },
  { engineMin: 1301, engineMax: 1600, valueMax: 309100, annualByAge: [10016, 7510, 4354, 3077, 1181] },
  { engineMin: 1301, engineMax: 1600, valueMax: 541500, annualByAge: [11023, 8264, 4794, 3375, 1290] },
  { engineMin: 1301, engineMax: 1600, annualByAge: [12028, 9012, 5220, 3685, 1408] },
  { engineMin: 1601, engineMax: 1800, valueMax: 775100, annualByAge: [19472, 15226, 8948, 5458, 2113] },
  { engineMin: 1601, engineMax: 1800, annualByAge: [21251, 16600, 9775, 5964, 2307] },
  { engineMin: 1801, engineMax: 2000, valueMax: 775100, annualByAge: [30679, 23625, 13886, 8264, 3248] },
  { engineMin: 1801, engineMax: 2000, annualByAge: [33474, 25784, 15147, 9012, 3547] },
  { engineMin: 2001, engineMax: 2500, valueMax: 968100, annualByAge: [46027, 33413, 20874, 12465, 4930] },
  { engineMin: 2001, engineMax: 2500, annualByAge: [50217, 36448, 22768, 13606, 5378] },
  { engineMin: 2501, engineMax: 3000, valueMax: 1937500, annualByAge: [64175, 55837, 34878, 18758, 6875] },
  { engineMin: 2501, engineMax: 3000, annualByAge: [70018, 60905, 38053, 20466, 7503] },
  { engineMin: 3001, engineMax: 3500, valueMax: 1937500, annualByAge: [97744, 87954, 52976, 26443, 9684] },
  { engineMin: 3001, engineMax: 3500, annualByAge: [106641, 95940, 57791, 28839, 10578] },
  { engineMin: 3501, engineMax: 4000, valueMax: 3101800, annualByAge: [153684, 132712, 78152, 34878, 13886] },
  { engineMin: 3501, engineMax: 4000, annualByAge: [167671, 144770, 85271, 38053, 15147] },
  { engineMin: 4001, engineMax: Number.POSITIVE_INFINITY, valueMax: 3683200, annualByAge: [251554, 188627, 111714, 50206, 19472] },
  { engineMin: 4001, engineMax: Number.POSITIVE_INFINITY, annualByAge: [274415, 205781, 121873, 54769, 21251] },
];

const PRE_2018_ROWS: readonly AgeBand[] = [
  [5750, 4010, 2238, 1689, 593],
  [10016, 7510, 4354, 3077, 1181],
  [17705, 13829, 8145, 4957, 1917],
  [27898, 21478, 12624, 7510, 2958],
  [41840, 30372, 18977, 11333, 4479],
  [58347, 50754, 31704, 17044, 6255],
  [88859, 79955, 48158, 24031, 8813],
  [139721, 120647, 71048, 31704, 12624],
  [228681, 171485, 101555, 45632, 17705],
];

const PRE_2018_ENGINE_BANDS = [1300, 1600, 1800, 2000, 2500, 3000, 3500, 4000, Number.POSITIVE_INFINITY] as const;
const AGE_LABELS = ['1–3 yaş', '4–6 yaş', '7–11 yaş', '12–15 yaş', '16 yaş ve üzeri'] as const;

export interface MtvInput {
  modelYear: number;
  firstRegistrationYear: number;
  vehicleType: 'combustion' | 'electric';
  engineCc?: number;
  motorPowerKw?: number;
  vehicleValue?: number;
  cascoValue?: number;
}

export interface MtvResult {
  annualTax: number;
  installment: number;
  age: number;
  ageBand: string;
  tariff: string;
  adjustedByCasco: boolean;
  electricVehicle: boolean;
  primaryLabel: string;
  primaryResult: string;
  secondaryResults: Record<string, string>;
  breakdown: Array<{ label: string; value: string | number }>;
  infoReference: { title: string; description: string };
}

function getAgeIndex(age: number): number {
  if (age <= 3) return 0;
  if (age <= 6) return 1;
  if (age <= 11) return 2;
  if (age <= 15) return 3;
  return 4;
}

function currentRowForInput(input: MtvInput): number {
  const tariffValue = Math.floor(input.vehicleValue! / 100) * 100;
  if (input.vehicleType === 'electric') {
    const power = input.motorPowerKw!;
    const powerBands = [
      { max: 70, rows: [0, 1, 2] },
      { max: 85, rows: [3, 4, 5] },
      { max: 105, rows: [6, 7] },
      { max: 120, rows: [8, 9] },
      { max: 150, rows: [10, 11] },
      { max: 180, rows: [12, 13] },
      { max: 210, rows: [14, 15] },
      { max: 240, rows: [16, 17] },
      { max: Number.POSITIVE_INFINITY, rows: [18, 19] },
    ];
    const band = powerBands.find((item) => power <= item.max)!;
    return band.rows.find((index) => {
      const threshold = CURRENT_ROWS[index].valueMax;
      return threshold === undefined || tariffValue <= threshold;
    }) ?? band.rows[band.rows.length - 1] ?? -1;
  }

  const bandRows = CURRENT_ROWS
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => input.engineCc! >= row.engineMin && input.engineCc! <= row.engineMax);
  return bandRows.find(({ row }) => row.valueMax === undefined || tariffValue <= row.valueMax)?.index
    ?? bandRows[bandRows.length - 1]?.index
    ?? -1;
}

function pre2018RowIndex(engineCc: number): number {
  return PRE_2018_ENGINE_BANDS.findIndex((upperBound) => engineCc <= upperBound);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function calculateMtv(input: MtvInput): MtvResult {
  const { modelYear, firstRegistrationYear, vehicleType, vehicleValue, cascoValue } = input;
  if (!Number.isInteger(modelYear) || modelYear < 1900 || modelYear > MTV_TAX_YEAR) {
    throw new Error(`Model yılı 1900 ile ${MTV_TAX_YEAR} arasında olmalıdır.`);
  }
  if (!Number.isInteger(firstRegistrationYear) || firstRegistrationYear < 1900 || firstRegistrationYear > MTV_TAX_YEAR) {
    throw new Error(`İlk tescil yılı 1900 ile ${MTV_TAX_YEAR} arasında olmalıdır.`);
  }
  if (firstRegistrationYear < modelYear) {
    throw new Error('İlk tescil yılı model yılından önce olamaz.');
  }
  const isPre2018 = firstRegistrationYear <= 2017;
  if (!isPre2018 && (!Number.isFinite(vehicleValue) || vehicleValue! <= 0)) {
    throw new Error('2018 ve sonrası tescillerde vergilemeye esas taşıt değeri 0 TL’den büyük olmalıdır.');
  }
  if (cascoValue !== undefined && (!Number.isFinite(cascoValue) || cascoValue <= 0)) {
    throw new Error('Kasko değeri girilecekse 0 TL’den büyük olmalıdır.');
  }
  if (vehicleType === 'combustion' && (!Number.isInteger(input.engineCc) || input.engineCc! < 1 || input.engineCc! > 10000)) {
    throw new Error('Motor hacmi 1 ile 10.000 cm³ arasında tam sayı olmalıdır.');
  }
  if (vehicleType === 'electric' && (!Number.isFinite(input.motorPowerKw) || input.motorPowerKw! <= 0 || input.motorPowerKw! > 2000)) {
    throw new Error('Elektrik motor gücü 0 ile 2.000 kW arasında olmalıdır.');
  }
  if (vehicleType === 'electric' && firstRegistrationYear < 2018) {
    throw new Error('Bu hesaplayıcı elektrikli araçlarda 2018 ve sonrası ilk tescilleri destekler.');
  }

  const age = Math.max(1, MTV_TAX_YEAR - modelYear + 1);
  const ageIndex = getAgeIndex(age);
  const tariff = isPre2018 ? '2017 ve öncesi tescil (I/A)' : '2018 ve sonrası tescil (I)';
  let rowIndex = isPre2018 ? pre2018RowIndex(input.engineCc!) : currentRowForInput(input);
  if (rowIndex < 0) throw new Error('Girilen motor hacmi için tarife satırı bulunamadı.');

  const rows = isPre2018 ? PRE_2018_ROWS : CURRENT_ROWS.map((row) => row.annualByAge);
  const rawTax = (rows[rowIndex][ageIndex] * (vehicleType === 'electric' ? 0.25 : 1));
  const cascoRatio = isPre2018 ? 0.05 : 0.10;
  const adjustedByCasco = cascoValue !== undefined && rawTax > cascoValue * cascoRatio && rowIndex > 0;
  if (adjustedByCasco) rowIndex -= 1;

  // MTV amounts are payable in whole lira; ignore fractional lira per the law.
  const annualTax = Math.floor(rows[rowIndex][ageIndex] * (vehicleType === 'electric' ? 0.25 : 1));
  const installment = annualTax / 2;
  const ageBand = AGE_LABELS[ageIndex];
  const details = [
    { label: '2026 yıllık MTV', value: `${formatCurrency(annualTax)} TL` },
    { label: '1. taksit', value: `${formatCurrency(installment)} TL` },
    { label: '2. taksit', value: `${formatCurrency(installment)} TL` },
    { label: 'Vergi yaşı', value: `${age} (${ageBand})` },
    { label: 'Uygulanan tarife', value: tariff },
  ];
  if (vehicleType === 'electric') details.push({ label: 'Elektrikli araç indirimi', value: 'Tarife tutarının %25’i' });
  if (adjustedByCasco) details.push({ label: 'Kasko değeri uygulaması', value: 'Önceki tarife satırı uygulandı' });

  return {
    annualTax,
    installment,
    age,
    ageBand,
    tariff,
    adjustedByCasco,
    electricVehicle: vehicleType === 'electric',
    primaryLabel: '2026 Yıllık MTV',
    primaryResult: `${formatCurrency(annualTax)} TL`,
    secondaryResults: {
      '1. Taksit': `${formatCurrency(installment)} TL`,
      '2. Taksit': `${formatCurrency(installment)} TL`,
      'Vergi Yaşı': `${age} (${ageBand})`,
      'Tarife': tariff,
    },
    breakdown: details,
    infoReference: {
      title: 'MTV hesabının dayanağı',
      description: `Hesap, 2026 yılı otomobil tarifesine göre yapılır. ${adjustedByCasco ? 'Girilen kasko değeri için önceki tarife satırı uygulandı. ' : ''}Vergi yaşı model yılı ve takvim yılı esasına göre bulunur. Kasko indirimi için girilen değerin Türkiye Sigorta Birliği listesiyle uyumunu ayrıca kontrol edin.`,
    },
  };
}


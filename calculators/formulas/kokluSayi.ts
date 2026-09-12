export interface KokluSayiInput {
  sayi: number;
  derece: number;
}

export function calculateKokluSayi(input: KokluSayiInput) {
  const { sayi, derece } = input;

  if (typeof derece !== 'number' || !Number.isInteger(derece) || derece < 2) {
    throw new Error("Kök derecesi 2 veya daha büyük bir tam sayı olmalıdır.");
  }
  if (typeof sayi !== 'number') {
    throw new Error("Geçerli bir sayı giriniz.");
  }

  const isEven = derece % 2 === 0;
  if (isEven && sayi < 0) {
    throw new Error(`Çift dereceli kök (${derece}. kök) negatif sayılar için gerçek sayılar kümesinde tanımsızdır.`);
  }

  // Compute nth root, preserving sign for odd degrees
  let result: number;
  if (sayi < 0) {
    // Odd degree, negative radicand: ∛(-27) = -3
    result = -Math.pow(-sayi, 1 / derece);
  } else {
    result = Math.pow(sayi, 1 / derece);
  }

  if (!isFinite(result) || isNaN(result)) {
    throw new Error("Hesaplama aralık dışı bir sonuç verdi.");
  }

  // Check if result is a perfect integer root
  const roundedResult = Math.round(result);
  const isPerfect = Math.abs(Math.pow(roundedResult, derece) - sayi) < 1e-9;

  const formatNumber = (val: number, maxDecimals: number = 8) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: maxDecimals }).format(val);

  const displayResult = isPerfect
    ? formatNumber(roundedResult)
    : formatNumber(result);

  const degreeLabel = derece === 2 ? 'Kare kök (√)' : derece === 3 ? 'Küp kök (∛)' : `${derece}. kök`;

  return {
    primaryResult: displayResult,
    secondaryResults: {
      'Kök Derecesi': formatNumber(derece),
      'Sayı': formatNumber(sayi),
      'İşlem': `${degreeLabel}(${formatNumber(sayi)})`,
      'Tam Kök mü?': isPerfect ? 'Evet' : 'Hayır'
    }
  };
}

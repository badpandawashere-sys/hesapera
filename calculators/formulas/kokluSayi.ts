export function calculateKokluSayi(input: { sayi: number; derece: number }) {
  const { sayi, derece } = input;

  if (!Number.isInteger(derece) || derece < 2) {
    throw new Error("Kök derecesi 2 veya daha büyük bir tam sayı olmalıdır.");
  }

  const isEven = derece % 2 === 0;
  if (isEven && sayi < 0) {
    throw new Error(`Çift dereceli kök (${derece}. kök) negatif sayılar için gerçek sayılar kümesinde tanımsızdır.`);
  }

  // Compute nth root, preserving sign for odd degrees
  let result: number;
  if (sayi < 0) {
    // Odd degree, negative radicand: ³√(-8) = -2
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

  const displayResult = isPerfect
    ? String(roundedResult)
    : result.toFixed(8).replace(/\.?0+$/, '');

  const degreeLabel = derece === 2 ? 'Kare kök (√)' : derece === 3 ? 'Küp kök (∛)' : `${derece}. kök`;

  return {
    primaryResult: displayResult,
    secondaryResults: {
      'Kök Derecesi': String(derece),
      'Sayı': String(sayi),
      'İşlem': `${degreeLabel}(${sayi})`,
      'Tam Kök mü': isPerfect ? 'Evet' : 'Hayır'
    }
  };
}

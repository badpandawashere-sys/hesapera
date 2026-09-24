export interface KomisyonInputs {
  mode: 'calculate_commission' | 'calculate_target_gross' | 'calculate_rate';
  grossAmount?: number;
  commissionRate?: number;
  targetNet?: number;
  commissionAmount?: number;
}

export interface KomisyonResult {
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  commissionRate: number;
  success: boolean;
  errors?: string[];
}

export function calculateKomisyon(inputs: KomisyonInputs): KomisyonResult {
  const errors: string[] = [];

  const safeNum = (v: any) => {
    const parsed = typeof v === 'string' ? parseFloat(v) : v;
    return typeof parsed === 'number' && !isNaN(parsed) ? parsed : 0;
  };

  const mode = inputs.mode || 'calculate_commission';
  let grossAmount = safeNum(inputs.grossAmount);
  let commissionRate = safeNum(inputs.commissionRate);
  let targetNet = safeNum(inputs.targetNet);
  let commissionAmount = safeNum(inputs.commissionAmount);
  let netAmount = 0;

  if (grossAmount < 0) errors.push('Satış tutarı negatif olamaz.');
  if (commissionRate < 0) errors.push('Komisyon oranı negatif olamaz.');
  if (targetNet < 0) errors.push('Hedef net tutar negatif olamaz.');
  if (commissionAmount < 0) errors.push('Komisyon tutarı negatif olamaz.');

  if (mode === 'calculate_commission') {
    if (commissionRate >= 100) errors.push('Komisyon oranı %100 veya daha büyük olamaz.');
    
    commissionAmount = (grossAmount * commissionRate) / 100;
    netAmount = grossAmount - commissionAmount;

  } else if (mode === 'calculate_target_gross') {
    if (commissionRate >= 100) errors.push('Komisyon oranı %100 veya daha büyük olamaz. Kesinti %100 olursa hedef net tutara ulaşılamaz.');
    
    if (errors.length === 0) {
      grossAmount = targetNet / (1 - (commissionRate / 100));
      commissionAmount = grossAmount - targetNet;
      netAmount = targetNet;
    }

  } else if (mode === 'calculate_rate') {
    if (commissionAmount > grossAmount) errors.push('Komisyon tutarı satış tutarından büyük olamaz.');
    
    if (errors.length === 0) {
      if (grossAmount > 0) {
        commissionRate = (commissionAmount / grossAmount) * 100;
      } else {
        commissionRate = 0;
      }
      netAmount = grossAmount - commissionAmount;
    }
  }

  // Handle Edge Cases for Infinity and NaN safely without throwing runtime errors
  if (!isFinite(grossAmount)) grossAmount = 0;
  if (!isFinite(commissionAmount)) commissionAmount = 0;
  if (!isFinite(netAmount)) netAmount = 0;
  if (!isFinite(commissionRate)) commissionRate = 0;

  return {
    grossAmount,
    commissionAmount,
    netAmount,
    commissionRate,
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

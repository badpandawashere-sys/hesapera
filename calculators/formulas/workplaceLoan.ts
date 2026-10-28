import { generateAmortizationSchedule } from './loan/amortization';

export type WorkplaceCustomerType = 'commercial' | 'individual' | 'exempt';

export interface WorkplaceLoanOptions {
  customerType?: WorkplaceCustomerType;
  bsmvRate?: number;
  kkdfRate?: number;
}

export function resolveTaxRates(options?: WorkplaceCustomerType | WorkplaceLoanOptions) {
  if (typeof options === 'string') {
    if (options === 'individual') {
      return { bsmvRate: 15, kkdfRate: 15, label: 'Bireysel Yatırımcı (%15 BSMV, %15 KKDF)' };
    }
    if (options === 'exempt') {
      return { bsmvRate: 0, kkdfRate: 0, label: 'Vergisiz Karşılaştırma Modu (Kanuni muafiyet değildir, %0 Vergi)' };
    }
    return { bsmvRate: 5, kkdfRate: 0, label: 'Ticari Müşteri (%5 BSMV, %0 KKDF)' };
  }

  if (options && typeof options === 'object') {
    if (options.bsmvRate !== undefined || options.kkdfRate !== undefined) {
      const bsmv = options.bsmvRate ?? 0;
      const kkdf = options.kkdfRate ?? 0;
      return {
        bsmvRate: bsmv,
        kkdfRate: kkdf,
        label: `Özel Oran (%${bsmv} BSMV, %${kkdf} KKDF)`
      };
    }
    return resolveTaxRates(options.customerType);
  }

  // Varsayılan: Ticari Gayrimenkul Kredisi (%5 BSMV, %0 KKDF)
  return { bsmvRate: 5, kkdfRate: 0, label: 'Ticari Müşteri (%5 BSMV, %0 KKDF)' };
}

export function calculateWorkplaceLoan(
  loanAmount: number,
  monthlyInterestRate: number,
  termMonths: number,
  customerTypeOrOptions?: WorkplaceCustomerType | WorkplaceLoanOptions
) {
  const { bsmvRate, kkdfRate, label: taxLabel } = resolveTaxRates(customerTypeOrOptions);

  const result = generateAmortizationSchedule({
    principal: loanAmount,
    monthlyInterestRate: monthlyInterestRate,
    termMonths: termMonths,
    bsmvRate: bsmvRate,
    kkdfRate: kkdfRate
  });
  
  const currencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

  const formattedTable = result.schedule.map(row => ({
    'Taksit No': row.installmentNumber,
    'Taksit Tutarı': currencyFormatter.format(row.payment),
    'Anapara': currencyFormatter.format(row.principalPaid),
    'Faiz': currencyFormatter.format(row.interestPaid),
    'BSMV': currencyFormatter.format(row.bsmvPaid ?? 0),
    'KKDF': currencyFormatter.format(row.kkdfPaid ?? 0),
    'Kalan Bakiye': currencyFormatter.format(row.remainingPrincipal)
  }));
  
  const totalBSMV = result.totalBSMV ?? 0;
  const totalKKDF = result.totalKKDF ?? 0;

  const secondaryResults: Record<string, string> = {
    'Kredi Tutarı': currencyFormatter.format(loanAmount),
    'Vade': `${termMonths} Ay`,
    'Aylık Faiz Oranı': `%${monthlyInterestRate.toFixed(2)}`,
    'Toplam Faiz': currencyFormatter.format(result.totalInterest),
    'Toplam BSMV': currencyFormatter.format(totalBSMV)
  };

  if (kkdfRate > 0) {
    secondaryResults['Toplam KKDF'] = currencyFormatter.format(totalKKDF);
  } else {
    secondaryResults['Toplam KKDF'] = '₺0,00 (Muaf)';
  }

  secondaryResults['Toplam Vergi (BSMV+KKDF)'] = currencyFormatter.format(totalBSMV + totalKKDF);
  secondaryResults['Toplam Geri Ödeme'] = currencyFormatter.format(result.totalPayment);
  secondaryResults['Vergi Rejimi'] = taxLabel;

  return {
    primaryResult: currencyFormatter.format(result.monthlyPayment),
    primaryLabel: 'Aylık Taksit Tutarı',
    secondaryResults,
    table: formattedTable,
    breakdown: [
      { label: 'Kredi Tutarı', value: currencyFormatter.format(loanAmount) },
      { label: 'Aylık Taksit Tutarı', value: currencyFormatter.format(result.monthlyPayment) },
      { label: 'Vade', value: `${termMonths} Ay` },
      { label: 'Aylık Faiz Oranı', value: `%${monthlyInterestRate.toFixed(2)}` },
      { label: 'Toplam Faiz Maliyeti', value: currencyFormatter.format(result.totalInterest) },
      { label: 'Toplam BSMV', value: currencyFormatter.format(totalBSMV) },
      { label: 'Toplam KKDF', value: kkdfRate > 0 ? currencyFormatter.format(totalKKDF) : '₺0,00 (Muaf)' },
      { label: 'Toplam Geri Ödeme', value: currencyFormatter.format(result.totalPayment) }
    ],
    rawValues: {
      monthlyPayment: Math.round(result.monthlyPayment * 100) / 100,
      totalPayment: Math.round(result.totalPayment * 100) / 100,
      totalInterest: Math.round(result.totalInterest * 100) / 100,
      totalBSMV: Math.round(totalBSMV * 100) / 100,
      totalKKDF: Math.round(totalKKDF * 100) / 100,
      principal: loanAmount,
      termMonths,
      monthlyInterestRate,
      bsmvRate,
      kkdfRate,
      schedule: result.schedule
    },
    infoReference: {
      title: 'Yasal Mevzuat ve Masraf Bilgilendirmesi',
      description: 'Bu hesaplama eşit taksitli anüite (Fransız amortisman) modeliyle hazırlanmış örnek bir ödeme planıdır. 6802 sayılı Gider Vergileri Kanunu ve 88/12944 sayılı KKDF Kararnamesi uyarınca ticari kredilerde faiz üzerinden %5 BSMV uygulanmakta olup TL ticari kredilerde KKDF oranı %0\'dır (Bireysel tüketici amaçlı kullanımlarda ise 7347 sayılı CK ve 2012/3141 sayılı BKK uyarınca %15 BSMV ve %15 KKDF tahakkuk eder; vergisiz seçenek ise kanuni bir muafiyet olmayıp yalnızca karşılaştırma amaçlı simülasyon modudur). TCMB 2020/4 sayılı Tebliğ uyarınca ticari kredilerde tahsis ve kullandırım ücretleri ayrı ayrı belirlenir (bireysel kredilerdeki azami binde 5 kuralı ticari kredileri kapsamaz). Ekspertiz raporu bedeli, ipotek tesis ücreti ve zorunlu sigortalar taksitlere dahil edilmemiştir.'
    }
  };
}
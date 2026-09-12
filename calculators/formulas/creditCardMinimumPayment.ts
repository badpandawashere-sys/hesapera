export function calculateCreditCardMinimumPayment(statementBalance: number, minimumPaymentRate: number) {
  const minimumPayment = statementBalance * (minimumPaymentRate / 100);
  
  return {
    primaryLabel: 'Asgari Ödeme Tutarı',
    primaryResult: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(minimumPayment),
    secondaryResults: {
      'Dönem Borcu': new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(statementBalance),
      'Asgari Ödeme Oranı': '%' + minimumPaymentRate
    },
    infoReference: {
      title: 'Kredi Kartı Asgari Ödeme Tutarı Nasıl Hesaplanır?',
      description: 'Hesaplama, girilen dönem borcu ile kullanıcının belirttiği asgari ödeme oranı üzerinden yapılır. Kredi kartı asgari ödeme oranları ilgili mevzuat ve kartın özelliklerine göre değişebilir. Kullanıcı güncel ekstresinde/bankasında uygulanan asgari ödeme oranını kontrol etmelidir. Bu hesaplayıcı kullanıcı tarafından girilen oranı matematiksel olarak uygular.'
    }
  };
}
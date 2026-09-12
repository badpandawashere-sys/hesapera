const fs = require('fs');
let c = fs.readFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/formulas/currency.ts', 'utf8');
if (!c.includes('isNaN(quote.buyPrice)')) {
   c = c.replace(
     'export function calculateCurrency(transactionType: string, currencyCode: string, quantity: number, tryAmount: number, quote: MarketQuote) {',
     'export function calculateCurrency(transactionType: string, currencyCode: string, quantity: number, tryAmount: number, quote: MarketQuote) {\n  if (!quote || isNaN(quote.buyPrice) || isNaN(quote.sellPrice) || quote.buyPrice <= 0 || quote.sellPrice <= 0) {\n    throw new Error(`Canlı piyasa verisi şu anda alınamıyor.`);\n  }'
   );
   fs.writeFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/formulas/currency.ts', c, 'utf8');
   console.log('Fixed currency.ts NaN handling');
}

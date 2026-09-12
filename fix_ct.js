const fs = require('fs');
let c = fs.readFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/formulas/__tests__/currency.test.ts', 'utf8');
if (!c.includes('NaN Handling')) {
   c = c.replace('});', `
  it('TEST 4: NaN Handling', () => {
    const invalidQuote = { ...mockQuote, buyPrice: NaN, sellPrice: NaN };
    expect(() => calculateCurrency('to_try', 'USD', 100, 0, invalidQuote)).toThrow(/al.nam.yor/);
  });
});`);
   fs.writeFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/formulas/__tests__/currency.test.ts', c, 'utf8');
   console.log('Added NaN test to currency');
}

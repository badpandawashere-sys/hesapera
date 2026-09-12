const fs = require('fs');
let c = fs.readFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/formulas/__tests__/currency.test.ts', 'utf8');
c = c.replace(/Kullanılan Kur/g, 'Piyasa Kuru');
fs.writeFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/formulas/__tests__/currency.test.ts', c, 'utf8');

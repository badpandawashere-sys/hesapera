const fs = require('fs');
let c = fs.readFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/definitions/interest.ts', 'utf8');

c = c.replace(
  /      conditions: \[\{\n        field: "calculationType",\n        operator: "equals",\n        value: "compound"\n      \}\],/g,
  "      conditions: [{\n        fieldId: \"calculationType\",\n        operator: \"equals\",\n        value: \"compound\"\n      }],"
);

fs.writeFileSync('c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/definitions/interest.ts', c, 'utf8');
console.log('Fixed fieldId');

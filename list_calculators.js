const fs = require('fs');
const path = require('path');

const defDir = 'c:/UYGULAMA PROJESİ MERTKAN/HESAPERA/calculators/definitions';
const files = fs.readdirSync(defDir).filter(f => f.endsWith('.ts'));

const calculators = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(defDir, file), 'utf8');
  
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const slugMatch = content.match(/slug:\s*['"]([^'"]+)['"]/);
  const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  
  calculators.push({
    file,
    id: idMatch ? idMatch[1] : 'NOT_FOUND',
    slug: slugMatch ? slugMatch[1] : 'NOT_FOUND',
    name: nameMatch ? nameMatch[1] : 'NOT_FOUND',
    category: categoryMatch ? categoryMatch[1] : 'NOT_FOUND'
  });
}

console.log(JSON.stringify(calculators, null, 2));

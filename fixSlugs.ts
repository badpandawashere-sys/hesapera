import fs from 'fs';
import path from 'path';

// Define the known slug mismatches (calculators.ts href -> correct slug)
const fixes = [
  { old: '/hesaplama/basit-faiz-hesaplama', new: '/hesaplama/basit-faiz' },
  { old: '/hesaplama/bilesik-faiz-hesaplama', new: '/hesaplama/bilesik-faiz' },
  { old: '/hesaplama/yuzde-hesaplama', new: '/hesaplama/yuzde' },
  { old: '/hesaplama/kdv-hesaplama', new: '/hesaplama/kdv' },
  { old: '/hesaplama/indirim-hesaplama', new: '/hesaplama/indirim' },
  { old: '/hesaplama/zam-hesaplama', new: '/hesaplama/zam' },
  { old: '/hesaplama/oran-hesaplama', new: '/hesaplama/oran' },
  { old: '/hesaplama/asgari-ucret', new: '/hesaplama/asgari-ucret' },
  { old: '/hesaplama/brutten-nete', new: '/hesaplama/brutten-nete' },
  { old: '/hesaplama/kombinasyon-hesaplama', new: '/hesaplama/kombinasyon' },
  { old: '/hesaplama/ebob-ekok-hesaplama', new: '/hesaplama/ebob-ekok' }
];

const p = path.resolve('lib/data/calculators.ts');
let content = fs.readFileSync(p, 'utf-8');

for (const fix of fixes) {
  content = content.replace(new RegExp(fix.old, 'g'), fix.new);
}

fs.writeFileSync(p, content, 'utf-8');
console.log('Fixed mismatches in calculators.ts');

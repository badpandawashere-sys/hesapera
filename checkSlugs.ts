import { CalculatorRegistry } from './calculators/core/calculator-registry';
import './calculators/core/init';
import { mockCalculators } from './lib/data/calculators';

const registeredSlugs = CalculatorRegistry.getAll().map(c => c.slug);
console.log(`Registered calculators count: ${registeredSlugs.length}`);

let missing = 0;
for (const calc of mockCalculators) {
  const slug = calc.href.replace('/hesaplama/', '');
  if (!registeredSlugs.includes(slug)) {
    console.log(`Missing from registry: ${slug} (ID: ${calc.id})`);
    missing++;
  }
}
console.log(`Total missing: ${missing}`);

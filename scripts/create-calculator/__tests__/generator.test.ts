import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { createCalculator, createSpecFromAnswers } from '../core.mjs';

const workspaces: string[] = [];

async function createWorkspace() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'hesapera-generator-'));
  workspaces.push(root);
  await Promise.all([
    mkdir(path.join(root, 'calculators', 'definitions'), { recursive: true }),
    mkdir(path.join(root, 'calculators', 'formulas', '__tests__'), { recursive: true }),
    mkdir(path.join(root, 'calculators', 'core'), { recursive: true }),
    mkdir(path.join(root, 'components', 'calculator', '__tests__'), { recursive: true }),
  ]);
  await writeFile(
    path.join(root, 'calculators', 'core', 'init.ts'),
    `import { CalculatorRegistry } from './calculator-registry';

/**
 * Bootstraps calculators.
 */
let initialized = false;
export function initializeCalculators() {
  if (initialized) return;
  CalculatorRegistry.clear();
  initialized = true;
}
`,
  );
  await writeFile(
    path.join(root, 'calculators', 'core', 'calculator-registry.ts'),
    `const CATEGORY_MAP: Record<string, string> = {
};

class Registry {}
`,
  );
  await writeFile(
    path.join(root, 'components', 'calculator', 'generated-premium-forms.ts'),
    `// calculator-scaffold:premium-imports:start
// calculator-scaffold:premium-imports:end

export const generatedPremiumForms = {
  // calculator-scaffold:premium-entries:start
  // calculator-scaffold:premium-entries:end
};
`,
  );
  return root;
}

function validSpec(name = 'Örnek Maliyet') {
  return createSpecFromAnswers({
    name,
    category: 'otomotiv',
    inputLines: [
      'amount / number / TL / required',
      'distance / number / km / required',
    ],
    formulaText: 'costPerKm = amount / distance\ncostPer100Km = costPerKm * 100',
    outputLines: ['costPerKm / TL/km', 'costPer100Km / TL/100km'],
  });
}

afterEach(async () => {
  await Promise.all(workspaces.splice(0).map(workspace => rm(workspace, { recursive: true, force: true })));
});

describe('calculator generator', () => {
  it('generates a valid standard calculator from the five answers', async () => {
    const rootDir = await createWorkspace();
    const spec = validSpec();
    const result = await createCalculator({ rootDir, spec });

    expect(result.changes.map(change => change.label)).toEqual([
      'definition',
      'formula',
      'tests',
      'init registration',
      'registry category',
    ]);
    expect(spec.status).toBe('draft');
    expect(spec.uiMode).toBe('standard');
    expect(spec.validationLimits.amount).toEqual({ min: 0.01, max: 1_000_000 });

    const definition = await readFile(path.join(rootDir, 'calculators/definitions/ornekMaliyet.ts'), 'utf8');
    const formula = await readFile(path.join(rootDir, 'calculators/formulas/ornekMaliyet.ts'), 'utf8');
    const tests = await readFile(path.join(rootDir, 'calculators/formulas/__tests__/ornekMaliyet.test.ts'), 'utf8');
    expect(definition).toContain("status: \"draft\"");
    expect(definition).toContain('z.number().finite().min(0.01).max(1000000)');
    expect(definition).toContain("title: \"\"");
    expect(formula).toContain('const costPerKm = amount / distance;');
    expect(formula).toContain('const costPer100Km = costPerKm * 100;');
    expect(tests).toContain("it.each([0, -1, NaN, Infinity, -Infinity])");
    for (const source of [definition, formula, tests]) {
      const transpiled = ts.transpileModule(source, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
        reportDiagnostics: true,
      });
      expect(transpiled.diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)).toEqual([]);
    }
  });

  it('rejects a duplicate slug before changing files', async () => {
    const rootDir = await createWorkspace();
    const spec = validSpec();
    await createCalculator({ rootDir, spec });

    await expect(createCalculator({ rootDir, spec })).rejects.toThrow('Duplicate calculator slug');
  });

  it('supports dry-run without writing any file', async () => {
    const rootDir = await createWorkspace();
    const initPath = path.join(rootDir, 'calculators/core/init.ts');
    const initialInit = await readFile(initPath, 'utf8');
    const result = await createCalculator({ rootDir, spec: validSpec(), dryRun: true });

    expect(result.dryRun).toBe(true);
    await expect(readFile(path.join(rootDir, 'calculators/definitions/ornekMaliyet.ts'), 'utf8')).rejects.toThrow();
    expect(await readFile(initPath, 'utf8')).toBe(initialInit);
  });

  it('never overwrites an existing target file', async () => {
    const rootDir = await createWorkspace();
    const formulaPath = path.join(rootDir, 'calculators/formulas/ornekMaliyet.ts');
    await writeFile(formulaPath, '// existing user work\n');

    await expect(createCalculator({ rootDir, spec: validSpec() })).rejects.toThrow('üzerine yazılmayacak');
    expect(await readFile(formulaPath, 'utf8')).toBe('// existing user work\n');
  });

  it('inserts registry and init entries deterministically', async () => {
    const firstRoot = await createWorkspace();
    const secondRoot = await createWorkspace();
    const alpha = validSpec('Alfa Hesaplama');
    const beta = validSpec('Beta Hesaplama');

    await createCalculator({ rootDir: firstRoot, spec: beta });
    await createCalculator({ rootDir: firstRoot, spec: alpha });
    await createCalculator({ rootDir: secondRoot, spec: alpha });
    await createCalculator({ rootDir: secondRoot, spec: beta });

    expect(await readFile(path.join(firstRoot, 'calculators/core/init.ts'), 'utf8'))
      .toBe(await readFile(path.join(secondRoot, 'calculators/core/init.ts'), 'utf8'));
    expect(await readFile(path.join(firstRoot, 'calculators/core/calculator-registry.ts'), 'utf8'))
      .toBe(await readFile(path.join(secondRoot, 'calculators/core/calculator-registry.ts'), 'utf8'));
  });

  it('scaffolds premium calculators through the shared premium components', async () => {
    const rootDir = await createWorkspace();
    const spec = { ...validSpec('Premium Örnek'), uiMode: 'premium' as const };
    await createCalculator({ rootDir, spec });

    const form = await readFile(path.join(rootDir, 'components/calculator/premium-ornek-form.tsx'), 'utf8');
    const map = await readFile(path.join(rootDir, 'components/calculator/generated-premium-forms.ts'), 'utf8');
    expect(form).toContain('PremiumGeneratedCalculatorForm');
    expect(map).toContain("'premium-ornek': PremiumOrnekForm");
  });
});

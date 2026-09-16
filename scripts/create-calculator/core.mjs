import { promises as fs } from 'node:fs';
import path from 'node:path';

const CORE_CATEGORIES = new Set(['finance', 'math', 'health', 'education', 'conversion', 'other']);
const INPUT_TYPES = new Set(['number', 'currency', 'percentage']);
const STATUSES = new Set(['draft', 'published']);
const UI_MODES = new Set(['standard', 'premium']);
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_IDENTIFIERS = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function',
  'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null',
  'package', 'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 'this',
  'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
]);
const ALLOWED_MATH_NAMES = new Set([
  'Math', 'PI', 'E', 'abs', 'ceil', 'floor', 'round', 'trunc', 'min', 'max', 'pow', 'sqrt',
  'cbrt', 'log', 'log10', 'exp', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
]);

const CATEGORY_ALIASES = {
  finans: 'finance',
  kredi: 'finance',
  matematik: 'math',
  saglik: 'health',
  'egitim-sinav': 'education',
  eğitim: 'education',
  education: 'education',
  finance: 'finance',
  math: 'math',
  health: 'health',
  conversion: 'conversion',
};

const MARKERS = {
  initImports: ['// calculator-scaffold:imports:start', '// calculator-scaffold:imports:end'],
  initRegisters: ['  // calculator-scaffold:registrations:start', '  // calculator-scaffold:registrations:end'],
  categories: ['  // calculator-scaffold:categories:start', '  // calculator-scaffold:categories:end'],
  premiumImports: ['// calculator-scaffold:premium-imports:start', '// calculator-scaffold:premium-imports:end'],
  premiumEntries: ['  // calculator-scaffold:premium-entries:start', '  // calculator-scaffold:premium-entries:end'],
};

function trAscii(value) {
  return value
    .replaceAll('ı', 'i').replaceAll('İ', 'I')
    .replaceAll('ğ', 'g').replaceAll('Ğ', 'G')
    .replaceAll('ü', 'u').replaceAll('Ü', 'U')
    .replaceAll('ş', 's').replaceAll('Ş', 'S')
    .replaceAll('ö', 'o').replaceAll('Ö', 'O')
    .replaceAll('ç', 'c').replaceAll('Ç', 'C');
}

export function slugify(value) {
  return trAscii(String(value).trim())
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pascalFromSlug(slug) {
  return slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function camelFromSlug(slug) {
  const pascal = pascalFromSlug(slug);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function humanizeIdentifier(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

function parseFiniteOption(parts, key, fallback) {
  const raw = parts.find(part => part.startsWith(`${key}=`));
  if (!raw) return fallback;
  const value = Number(raw.slice(key.length + 1));
  if (!Number.isFinite(value)) throw new Error(`${key} finite bir sayı olmalıdır.`);
  return value;
}

export function parseInputLines(lines) {
  return lines.filter(Boolean).map((line, index) => {
    const parts = line.split('/').map(part => part.trim()).filter(Boolean);
    if (parts.length < 4) {
      throw new Error(`Input ${index + 1}: "id / type / unit / required" formatı bekleniyor.`);
    }
    const [id, type, unit, requirement, ...options] = parts;
    const min = parseFiniteOption(options, 'min', 0.01);
    const max = parseFiniteOption(options, 'max', 1_000_000);
    const step = parseFiniteOption(options, 'step', type === 'number' ? 0.01 : 0.01);
    return {
      id,
      label: humanizeIdentifier(id),
      type,
      unit: unit === '-' ? undefined : unit,
      required: ['required', 'zorunlu', 'true'].includes(requirement.toLowerCase()),
      min,
      max,
      step,
    };
  });
}

export function parseOutputLines(lines) {
  return lines.filter(Boolean).map((line, index) => {
    const parts = line.split('/').map(part => part.trim());
    if (!parts[0]) throw new Error(`Output ${index + 1}: output kimliği eksik.`);
    return {
      id: parts[0],
      label: humanizeIdentifier(parts[0]),
      unit: parts[1] && parts[1] !== '-' ? parts[1] : undefined,
    };
  });
}

export function parseFormulaAssignments(formulaText) {
  return formulaText
    .split(/\r?\n|;/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(.+)$/);
      if (!match) throw new Error(`Formül ${index + 1}: "output = ifade" formatı bekleniyor.`);
      return { outputId: match[1], expression: match[2].trim() };
    });
}

export function createSpecFromAnswers({
  name,
  category,
  inputLines,
  formulaText,
  outputLines,
  status = 'draft',
  uiMode = 'standard',
}) {
  const slug = slugify(name);
  const uiCategory = slugify(category);
  const inputs = parseInputLines(inputLines);
  const outputs = parseOutputLines(outputLines);
  const coreCategory = CATEGORY_ALIASES[uiCategory] ?? 'other';
  const fileStem = camelFromSlug(slug);

  const spec = {
    slug,
    fileStem,
    name: String(name).trim(),
    category: coreCategory,
    uiCategory,
    status,
    inputs,
    outputs,
    validationLimits: Object.fromEntries(inputs.map(input => [input.id, { min: input.min, max: input.max }])),
    formula: {
      identifier: `calculate${pascalFromSlug(slug)}`,
      assignments: parseFormulaAssignments(formulaText),
    },
    uiMode,
    relatedCalculatorSlugs: [],
    content: {
      title: '',
      description: '',
      shortDescription: '',
      howItWorks: [],
      guide: [],
      example: { title: '', text: '' },
      faq: [],
    },
  };
  validateSpec(spec);
  return spec;
}

function validateExpression(expression, allowedIdentifiers) {
  if (!expression || expression.length > 500) throw new Error('Formül ifadesi boş veya çok uzun.');
  if (/[^A-Za-z0-9_$+\-*/%().,\s]/.test(expression) || /\/\*|\/\//.test(expression)) {
    throw new Error(`Güvenli olmayan formül ifadesi: ${expression}`);
  }
  let depth = 0;
  for (const character of expression) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (depth < 0) throw new Error(`Dengesiz parantez: ${expression}`);
  }
  if (depth !== 0) throw new Error(`Dengesiz parantez: ${expression}`);

  const names = expression.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) ?? [];
  for (const name of names) {
    if (!allowedIdentifiers.has(name) && !ALLOWED_MATH_NAMES.has(name)) {
      throw new Error(`Formülde bilinmeyen identifier: ${name}`);
    }
  }
}

export function validateSpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('CalculatorScaffoldSpec gerekli.');
  if (!spec.name?.trim()) throw new Error('Araç adı gerekli.');
  if (!SLUG.test(spec.slug)) throw new Error(`Geçersiz slug: ${spec.slug}`);
  if (!IDENTIFIER.test(spec.fileStem) || RESERVED_IDENTIFIERS.has(spec.fileStem)) throw new Error(`Geçersiz fileStem: ${spec.fileStem}`);
  if (!CORE_CATEGORIES.has(spec.category)) throw new Error(`Geçersiz core kategori: ${spec.category}`);
  if (!SLUG.test(spec.uiCategory)) throw new Error(`Geçersiz UI kategorisi: ${spec.uiCategory}`);
  if (!STATUSES.has(spec.status)) throw new Error(`Geçersiz status: ${spec.status}`);
  if (!UI_MODES.has(spec.uiMode)) throw new Error(`Geçersiz UI modu: ${spec.uiMode}`);
  if (!Array.isArray(spec.inputs) || spec.inputs.length === 0) throw new Error('En az bir input gerekli.');
  if (!Array.isArray(spec.outputs) || spec.outputs.length === 0) throw new Error('En az bir output gerekli.');

  const inputIds = new Set();
  for (const input of spec.inputs) {
    if (!IDENTIFIER.test(input.id) || RESERVED_IDENTIFIERS.has(input.id) || ALLOWED_MATH_NAMES.has(input.id) || inputIds.has(input.id)) {
      throw new Error(`Geçersiz veya duplicate input: ${input.id}`);
    }
    if (!INPUT_TYPES.has(input.type)) throw new Error(`Desteklenmeyen input tipi: ${input.type}`);
    if (typeof input.label !== 'string' || (input.step !== undefined && (!Number.isFinite(input.step) || input.step <= 0))) {
      throw new Error(`${input.id} alan tanımı geçersiz.`);
    }
    if (!Number.isFinite(input.min) || !Number.isFinite(input.max) || input.min <= 0 || input.max <= input.min) {
      throw new Error(`${input.id} için validation sınırları geçersiz.`);
    }
    inputIds.add(input.id);
  }

  const outputIds = new Set();
  for (const output of spec.outputs) {
    if (!IDENTIFIER.test(output.id) || RESERVED_IDENTIFIERS.has(output.id) || ALLOWED_MATH_NAMES.has(output.id) || outputIds.has(output.id) || inputIds.has(output.id)) {
      throw new Error(`Geçersiz veya duplicate output: ${output.id}`);
    }
    if (typeof output.label !== 'string') throw new Error(`${output.id} output etiketi geçersiz.`);
    outputIds.add(output.id);
  }
  if (!IDENTIFIER.test(spec.formula?.identifier ?? '') || RESERVED_IDENTIFIERS.has(spec.formula?.identifier)) {
    throw new Error('Formula identifier geçersiz.');
  }

  const assignments = new Map();
  const allowedIdentifiers = new Set(inputIds);
  for (const assignment of spec.formula.assignments ?? []) {
    if (!outputIds.has(assignment.outputId) || assignments.has(assignment.outputId)) {
      throw new Error(`Formül output eşleşmesi geçersiz: ${assignment.outputId}`);
    }
    validateExpression(assignment.expression, allowedIdentifiers);
    assignments.set(assignment.outputId, assignment.expression);
    allowedIdentifiers.add(assignment.outputId);
  }
  for (const outputId of outputIds) {
    if (!assignments.has(outputId)) throw new Error(`${outputId} için formül eksik.`);
  }

  for (const input of spec.inputs) {
    const limits = spec.validationLimits?.[input.id];
    if (!limits || limits.min !== input.min || limits.max !== input.max) {
      throw new Error(`${input.id} definition ve validation sınırları eşleşmiyor.`);
    }
  }
  for (const slug of spec.relatedCalculatorSlugs ?? []) {
    if (!SLUG.test(slug)) throw new Error(`Geçersiz related calculator slug: ${slug}`);
  }
  if (!spec.content || typeof spec.content.title !== 'string' || typeof spec.content.description !== 'string' ||
      typeof spec.content.shortDescription !== 'string' || !Array.isArray(spec.content.howItWorks) ||
      !Array.isArray(spec.content.guide) || !Array.isArray(spec.content.faq) ||
      typeof spec.content.example?.title !== 'string' || typeof spec.content.example?.text !== 'string') {
    throw new Error('Content placeholder yapısı geçersiz.');
  }
  if (spec.status === 'published' && (!spec.content.title.trim() || !spec.content.description.trim() || !spec.content.shortDescription.trim())) {
    throw new Error('Published calculator için title, description ve shortDescription doldurulmalıdır.');
  }
  return spec;
}

function quoted(value) {
  return JSON.stringify(value ?? '');
}

function formatUnitLabel(label, unit) {
  return unit ? `${label} (${unit})` : label;
}

function renderFormula(spec) {
  const interfaceName = `${pascalFromSlug(spec.slug)}Input`;
  const resultName = `${pascalFromSlug(spec.slug)}Result`;
  const inputFields = spec.inputs
    .map(input => `  ${input.id}${input.required ? '' : '?'}: number;`)
    .join('\n');
  const outputFields = spec.outputs.map(output => `  ${output.id}: number;`).join('\n');
  const guards = spec.inputs.map(input =>
    `  assertValidInput(${quoted(input.id)}, input.${input.id}, ${input.min}, ${input.max}, ${input.required});`,
  ).join('\n');
  const variables = spec.inputs.map(input => input.id).join(', ');
  const assignments = spec.formula.assignments
    .map(assignment => `  const ${assignment.outputId} = ${assignment.expression};`)
    .join('\n');
  const outputGuards = spec.outputs
    .map(output => `  assertFiniteOutput(${quoted(output.id)}, ${output.id});`)
    .join('\n');
  const rawOutputs = spec.outputs.map(output => `    ${output.id},`).join('\n');
  const [primary, ...secondary] = spec.outputs;
  const secondaryLines = secondary
    .map(output => `      ${quoted(output.label)}: formatValue(${output.id}, ${quoted(output.unit)}),`)
    .join('\n');

  return `export interface ${interfaceName} {\n${inputFields}\n}\n\nexport interface ${resultName} {\n${outputFields}\n  primaryResult: string;\n  secondaryResults: Record<string, string>;\n}\n\nfunction assertValidInput(name: string, value: number | undefined, min: number, max: number, required: boolean): void {\n  if (value === undefined && !required) return;\n  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {\n    throw new Error(\`\${name} \${min} ile \${max} arasında finite bir sayı olmalıdır.\`);\n  }\n}\n\nfunction assertFiniteOutput(name: string, value: number): void {\n  if (!Number.isFinite(value)) throw new Error(\`\${name} hesaplanabilir sayı aralığının dışında.\`);\n}\n\nfunction formatValue(value: number, unit?: string): string {\n  const formatted = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 6 }).format(value);\n  return unit ? \`\${formatted} \${unit}\` : formatted;\n}\n\nexport function ${spec.formula.identifier}(input: ${interfaceName}): ${resultName} {\n${guards}\n  const { ${variables} } = input;\n${assignments}\n${outputGuards}\n\n  return {\n${rawOutputs}\n    primaryResult: formatValue(${primary.id}, ${quoted(primary.unit)}),\n    secondaryResults: {\n${secondaryLines}\n    },\n  };\n}\n`;
}

function renderDefinition(spec) {
  const pascal = pascalFromSlug(spec.slug);
  const definitionName = `${spec.fileStem}CalculatorDef`;
  const schemaFields = spec.inputs.map(input => {
    const optional = input.required ? '' : '.optional()';
    return `  ${input.id}: z.number().finite().min(${input.min}).max(${input.max})${optional},`;
  }).join('\n');
  const fields = spec.inputs.map(input => `    {\n      id: ${quoted(input.id)},\n      label: ${quoted(formatUnitLabel(input.label, input.unit))},\n      type: ${quoted(input.type)},\n      required: ${input.required},\n      min: ${input.min},\n      max: ${input.max},\n      step: ${input.step ?? 0.01},\n    },`).join('\n');
  const related = JSON.stringify(spec.relatedCalculatorSlugs ?? []);
  const howItWorks = JSON.stringify(spec.content.howItWorks ?? []);
  const guide = JSON.stringify(spec.content.guide ?? []);
  const faq = JSON.stringify(spec.content.faq ?? []);

  return `import { z } from 'zod';\nimport type { CalculatorDefinition } from '../core/calculator-types';\nimport { ${spec.formula.identifier}, type ${pascal}Input } from '../formulas/${spec.fileStem}';\n\nexport const ${spec.fileStem}Schema = z.object({\n${schemaFields}\n});\n\nexport const ${definitionName}: CalculatorDefinition<${pascal}Input, ReturnType<typeof ${spec.formula.identifier}>> = {\n  id: ${quoted(`calc_${spec.slug.replaceAll('-', '_')}`)},\n  slug: ${quoted(spec.slug)},\n  status: ${quoted(spec.status)},\n  name: ${quoted(spec.name)},\n  shortDescription: ${quoted(spec.content.shortDescription)},\n  category: ${quoted(spec.category)},\n  type: 'simple',\n  fields: [\n${fields}\n  ],\n  metadata: {\n    title: ${quoted(spec.content.title)},\n    description: ${quoted(spec.content.description)},\n    keywords: [],\n    canonical: ${quoted(`https://www.hesapera.com.tr/hesaplama/${spec.slug}`)},\n    icon: 'Calculator',\n    faq: ${faq},\n    relatedCalculators: ${related},\n    content: {\n      intro: '',\n      sections: [\n        { title: 'Nasıl Çalışır?', paragraphs: ${howItWorks} },\n        { title: 'Hesaplama Rehberi', paragraphs: ${guide} },\n      ],\n      example: ${JSON.stringify(spec.content.example)},\n    },\n  },\n  schema: ${spec.fileStem}Schema,\n  calculate: ${spec.formula.identifier},\n};\n`;
}

function normalInput(spec) {
  return Object.fromEntries(spec.inputs.map(input => {
    const preferred = Math.max(input.min, 1);
    return [input.id, Math.min(preferred, input.max)];
  }));
}

function renderFormulaTest(spec) {
  const definitionName = `${spec.fileStem}CalculatorDef`;
  const values = JSON.stringify(normalInput(spec), null, 2).replace(/^/gm, '  ').trimStart();
  const outputChecks = spec.outputs.map(output => `    expect(Number.isFinite(result.${output.id})).toBe(true);`).join('\n');
  const invalidCases = spec.inputs.map(input => `  it.each([0, -1, NaN, Infinity, -Infinity])('rejects ${input.id}=%s', value => {\n    expect(() => ${spec.formula.identifier}({ ...validInput, ${input.id}: value })).toThrow();\n  });`).join('\n\n');
  const upperCases = spec.inputs.map(input => `    expect(${definitionName}.schema.safeParse({ ...validInput, ${input.id}: ${input.max} }).success).toBe(true);\n    expect(${definitionName}.schema.safeParse({ ...validInput, ${input.id}: ${input.max + Math.max(input.step ?? 0.01, 0.01)} }).success).toBe(false);`).join('\n');

  return `import { describe, expect, it } from 'vitest';\nimport { CalculatorRegistry } from '../../core/calculator-registry';\nimport '../../core/init';\nimport { ${definitionName} } from '../../definitions/${spec.fileStem}';\nimport { ${spec.formula.identifier} } from '../${spec.fileStem}';\n\nconst validInput = ${values};\n\ndescribe('${spec.name}', () => {\n  it('calculates a normal finite result', () => {\n    const result = ${spec.formula.identifier}(validInput);\n${outputChecks}\n    // TODO: AG onaylı örnek değerlerle kesin sonuç assertionları ekleyin.\n  });\n\n${invalidCases}\n\n  it('keeps definition and Zod upper limits aligned', () => {\n${upperCases}\n  });\n\n  it('is registered and follows its publish status', () => {\n    expect(CalculatorRegistry.getBySlug(${quoted(spec.slug)})).toBe(${definitionName});\n    const publishedSlugs = CalculatorRegistry.getPublishedAll().map(item => item.slug);\n    ${spec.status === 'published' ? `expect(publishedSlugs).toContain(${quoted(spec.slug)});` : `expect(publishedSlugs).not.toContain(${quoted(spec.slug)});`}
  });\n});\n`;
}

function renderPremiumForm(spec) {
  const componentName = `${pascalFromSlug(spec.slug)}Form`;
  return `'use client';\n\nimport { PremiumGeneratedCalculatorForm } from './premium-generated-calculator-form';\nimport type { CalculatorViewModel } from '@/calculators/core/calculator-types';\n\nexport function ${componentName}({ calculator }: { calculator: CalculatorViewModel }) {\n  return <PremiumGeneratedCalculatorForm calculator={calculator} />;\n}\n`;
}

function renderPremiumTest(spec) {
  const componentName = `${pascalFromSlug(spec.slug)}Form`;
  return `import { render, screen } from '@testing-library/react';\nimport { describe, expect, it, vi } from 'vitest';\nimport { ${componentName} } from '../${spec.slug}-form';\nimport { calculatorToViewModel } from '@/calculators/core/calculator-types';\nimport { ${spec.fileStem}CalculatorDef } from '@/calculators/definitions/${spec.fileStem}';\n\nvi.mock('@/app/actions/calculate', () => ({ calculateAction: vi.fn() }));\n\ndescribe('${spec.name} premium form', () => {\n  it('renders generated inputs and the shared premium CTA', () => {\n    render(<${componentName} calculator={calculatorToViewModel(${spec.fileStem}CalculatorDef)} />);\n    ${spec.inputs.map(input => `expect(screen.getByLabelText(new RegExp(${quoted(input.label)}, 'i'))).toBeDefined();`).join('\n    ')}\n    expect(screen.getByRole('button', { name: /Hesapera\\s*Hesapla/ })).toBeDefined();\n  });\n});\n`;
}

function normalizeLf(source) {
  return source.replace(/\r\n/g, '\n');
}

function restoreEol(source, original) {
  return original.includes('\r\n') ? source.replace(/\n/g, '\r\n') : source;
}

export function upsertMarkedLine(source, startMarker, endMarker, line, anchor) {
  const original = source;
  let normalized = normalizeLf(source);
  if (!normalized.includes(startMarker) || !normalized.includes(endMarker)) {
    const anchorIndex = normalized.indexOf(anchor);
    if (anchorIndex < 0) throw new Error(`Generator anchor bulunamadı: ${anchor.trim()}`);
    normalized = `${normalized.slice(0, anchorIndex)}${startMarker}\n${endMarker}\n${normalized.slice(anchorIndex)}`;
  }

  const start = normalized.indexOf(startMarker);
  const contentStart = start + startMarker.length;
  const end = normalized.indexOf(endMarker, contentStart);
  if (end < 0) throw new Error(`Generator marker kapanışı bulunamadı: ${endMarker}`);
  const existing = normalized.slice(contentStart, end).split('\n').map(item => item.trimEnd()).filter(item => item.trim());
  const lines = [...new Set([...existing, line])].sort((a, b) => a.trim().localeCompare(b.trim(), 'en'));
  const replacement = `${startMarker}\n${lines.join('\n')}${lines.length ? '\n' : ''}${endMarker}`;
  normalized = `${normalized.slice(0, start)}${replacement}${normalized.slice(end + endMarker.length)}`;
  return restoreEol(normalized, original);
}

async function readUtf8(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function assertSlugIsNew(rootDir, spec) {
  const definitionsDir = path.join(rootDir, 'calculators', 'definitions');
  const files = await fs.readdir(definitionsDir);
  for (const file of files.filter(file => file.endsWith('.ts'))) {
    const content = await readUtf8(path.join(definitionsDir, file));
    const match = content.match(/\bslug:\s*['"]([^'"]+)['"]/);
    if (match?.[1] === spec.slug) throw new Error(`Duplicate calculator slug: ${spec.slug}`);
  }
  const registry = await readUtf8(path.join(rootDir, 'calculators', 'core', 'calculator-registry.ts'));
  const mappedSlugs = [...registry.matchAll(/['"]([a-z0-9-]+)['"]\s*:/g)].map(match => match[1]);
  if (mappedSlugs.includes(spec.slug)) throw new Error(`Duplicate calculator slug: ${spec.slug}`);
}

export async function createScaffoldPlan({ rootDir, spec }) {
  validateSpec(spec);
  await assertSlugIsNew(rootDir, spec);

  const definitionPath = path.join(rootDir, 'calculators', 'definitions', `${spec.fileStem}.ts`);
  const formulaPath = path.join(rootDir, 'calculators', 'formulas', `${spec.fileStem}.ts`);
  const testPath = path.join(rootDir, 'calculators', 'formulas', '__tests__', `${spec.fileStem}.test.ts`);
  const createFiles = [
    { path: definitionPath, content: renderDefinition(spec), label: 'definition' },
    { path: formulaPath, content: renderFormula(spec), label: 'formula' },
    { path: testPath, content: renderFormulaTest(spec), label: 'tests' },
  ];

  if (spec.uiMode === 'premium') {
    createFiles.push(
      {
        path: path.join(rootDir, 'components', 'calculator', `${spec.slug}-form.tsx`),
        content: renderPremiumForm(spec),
        label: 'premium form',
      },
      {
        path: path.join(rootDir, 'components', 'calculator', '__tests__', `${spec.slug}-form.test.tsx`),
        content: renderPremiumTest(spec),
        label: 'UI tests',
      },
    );
  }

  for (const file of createFiles) {
    try {
      await fs.access(file.path);
      throw new Error(`Var olan dosyanın üzerine yazılmayacak: ${path.relative(rootDir, file.path)}`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  const initPath = path.join(rootDir, 'calculators', 'core', 'init.ts');
  const registryPath = path.join(rootDir, 'calculators', 'core', 'calculator-registry.ts');
  const initOriginal = await readUtf8(initPath);
  const registryOriginal = await readUtf8(registryPath);
  const definitionName = `${spec.fileStem}CalculatorDef`;
  let initContent = upsertMarkedLine(
    initOriginal,
    MARKERS.initImports[0],
    MARKERS.initImports[1],
    `import { ${definitionName} } from '../definitions/${spec.fileStem}';`,
    '/**\n * Bootstraps',
  );
  initContent = upsertMarkedLine(
    initContent,
    MARKERS.initRegisters[0],
    MARKERS.initRegisters[1],
    `  CalculatorRegistry.register(${definitionName});`,
    '  initialized = true;',
  );
  const registryContent = upsertMarkedLine(
    registryOriginal,
    MARKERS.categories[0],
    MARKERS.categories[1],
    `  '${spec.slug}': '${spec.uiCategory}',`,
    '};\n\nclass Registry',
  );

  const changes = [
    ...createFiles.map(file => ({ ...file, action: 'create' })),
    { path: initPath, content: initContent, label: 'init registration', action: 'update' },
    { path: registryPath, content: registryContent, label: 'registry category', action: 'update' },
  ];

  if (spec.uiMode === 'premium') {
    const premiumMapPath = path.join(rootDir, 'components', 'calculator', 'generated-premium-forms.ts');
    const premiumOriginal = await readUtf8(premiumMapPath);
    const componentName = `${pascalFromSlug(spec.slug)}Form`;
    let premiumContent = upsertMarkedLine(
      premiumOriginal,
      MARKERS.premiumImports[0],
      MARKERS.premiumImports[1],
      `import { ${componentName} } from './${spec.slug}-form';`,
      'export const generatedPremiumForms',
    );
    premiumContent = upsertMarkedLine(
      premiumContent,
      MARKERS.premiumEntries[0],
      MARKERS.premiumEntries[1],
      `  '${spec.slug}': ${componentName},`,
      '};',
    );
    changes.push({ path: premiumMapPath, content: premiumContent, label: 'premium UI registration', action: 'update' });
  }

  const relevantTestPaths = [path.relative(rootDir, testPath).replaceAll('\\', '/')];
  if (spec.uiMode === 'premium') {
    relevantTestPaths.push(`components/calculator/__tests__/${spec.slug}-form.test.tsx`);
  }
  return { spec, changes, relevantTestPaths };
}

export async function createCalculator({ rootDir, spec, dryRun = false }) {
  const plan = await createScaffoldPlan({ rootDir, spec });
  if (!dryRun) {
    for (const change of plan.changes.filter(change => change.action === 'create')) {
      await fs.mkdir(path.dirname(change.path), { recursive: true });
    }
    for (const change of plan.changes) {
      await fs.writeFile(change.path, change.content, 'utf8');
    }
  }
  return { ...plan, dryRun };
}

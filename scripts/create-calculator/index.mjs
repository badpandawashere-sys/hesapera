#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createCalculator, createSpecFromAnswers, validateSpec } from './core.mjs';

function hasFlag(name) {
  return process.argv.includes(name);
}

function valueAfter(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function collectLines(rl, prompt) {
  process.stdout.write(`${prompt}\n`);
  const lines = [];
  while (true) {
    const line = await rl.question(lines.length === 0 ? '> ' : '  ');
    if (!line.trim()) return lines;
    lines.push(line.trim());
  }
}

async function interactiveSpec(options) {
  const { createInterface } = await import('node:readline/promises');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const name = await rl.question('1. Araç adı:\n> ');
    const category = await rl.question('2. Kategori:\n> ');
    const inputLines = await collectLines(
      rl,
      '3. Inputlar (id / number|currency|percentage / birim / required|optional; bitirmek için boş satır):',
    );
    const formulaLines = await collectLines(
      rl,
      '4. Formül (her satır: output = ifade; bitirmek için boş satır):',
    );
    const outputLines = await collectLines(
      rl,
      '5. Outputlar (id / birim; bitirmek için boş satır):',
    );
    return createSpecFromAnswers({
      name,
      category,
      inputLines,
      formulaText: formulaLines.join('\n'),
      outputLines,
      status: options.status,
      uiMode: options.uiMode,
    });
  } finally {
    rl.close();
  }
}

function run(command, args, cwd) {
  process.stdout.write(`\n$ ${[command, ...args].join(' ')}\n`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) throw new Error(`Kontrol başarısız: ${command} ${args.join(' ')}`);
}

function runChecks(rootDir, plan) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  run(npm, ['run', 'test', '--', '--run', ...plan.relevantTestPaths], rootDir);
  run(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false', '--pretty', 'false'], rootDir);
  run(npm, ['run', 'build'], rootDir);
}

async function main() {
  const rootDir = process.cwd();
  const dryRun = hasFlag('--dry-run');
  const skipChecks = hasFlag('--skip-checks');
  const options = {
    status: 'draft',
    uiMode: hasFlag('--premium') ? 'premium' : 'standard',
  };
  const specFile = valueAfter('--spec');
  const spec = specFile
    ? validateSpec(JSON.parse(await readFile(path.resolve(rootDir, specFile), 'utf8')))
    : await interactiveSpec(options);

  const result = await createCalculator({ rootDir, spec, dryRun });
  process.stdout.write(`\n${dryRun ? 'Dry run — no files were written.' : 'Created:'}\n`);
  for (const change of result.changes) {
    process.stdout.write(`- ${change.label}: ${path.relative(rootDir, change.path)} (${change.action})\n`);
  }

  if (!dryRun && !skipChecks) runChecks(rootDir, result);
  if (dryRun) {
    process.stdout.write('\nChecks are skipped during dry-run.\n');
  } else if (skipChecks) {
    process.stdout.write('\nChecks skipped by --skip-checks.\n');
  }
}

main().catch(error => {
  process.stderr.write(`\nCalculator generator failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

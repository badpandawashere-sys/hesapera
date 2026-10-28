import { WagonRecord } from '@/types/raybilgi';
import { parseTurkishFloat, normalizeSerial } from '@/lib/raybilgi/mod5600-engine';
import {
  cleanCell,
  parseFullWagonIdentity,
  parseFreeText,
  isWagonNoCandidate,
} from '@/lib/raybilgi/mod5600-paste';

export type DaraRowStatus = 'resolved' | 'unknown_serial' | 'incomplete' | 'duplicate';

export interface DaraWagonInput {
  id: string;
  regime: string;
  serial: string;
  wagonNo: string;
  rawText?: string;
  source?: 'photo' | 'paste' | 'manual';
  confidence?: number;
  confidenceWarning?: string;
}

export interface DaraWagonRow {
  id: string;
  regime: string;
  serial: string;
  wagonNo: string;
  rawText?: string;
  source?: 'photo' | 'paste' | 'manual';
  wagonType: string;
  tare: number | null; // Metric tons (t)
  axle: number | null;
  length: number | null;
  status: DaraRowStatus;
  isDuplicate: boolean;
  statusMessage?: string;
  confidence?: number;
  confidenceWarning?: string;
}

export interface DaraTotals {
  totalCount: number;
  resolvedCount: number;
  controlNeededCount: number;
  duplicateCount: number;
  totalTare: number; // Metric tons (t)
  totalAxles: number;
  totalLength: number;
}

/**
 * Checks if a line resembles table headers rather than wagon data.
 */
export function isHeaderLine(line: string): boolean {
  const lower = line.toLowerCase();
  const headerTerms = [
    'rejim',
    'seri',
    'vagon no',
    'vagon',
    'çıkış',
    'cikis',
    'varış',
    'varis',
    'dara',
    'net ton',
    'dingil',
    'sıra',
    'sira',
  ];
  const matches = headerTerms.filter((term) => lower.includes(term));
  if (matches.length >= 2 && !/-\d/.test(line)) {
    return true;
  }
  return false;
}

/**
 * Parses a single line (tab-separated, space-separated, or compact) into wagon identity.
 */
export function parseSingleDaraLine(
  line: string
): { regime?: string; serial?: string; wagonNo?: string } | null {
  const clean = cleanCell(line);
  if (!clean) return null;

  // 1. Tab-separated input (Saha Vaziyeti / Excel clipboard)
  if (clean.includes('\t')) {
    let cells = clean
      .split('\t')
      .map((c) => cleanCell(c))
      .filter((c) => c !== '');

    if (cells.length === 0) return null;

    // Check if cells[0] is a row sequence index (e.g. "1", "2" from a "Sıra" column)
    if (
      cells.length >= 3 &&
      /^\d{1,3}$/.test(cells[0]) &&
      (/^\d{4}$/.test(cells[1]) || isWagonNoCandidate(cells[2]))
    ) {
      cells = cells.slice(1);
    }

    // 3+ columns:
    // Case A: regime (4 digits) + serial + wagonNo + ...
    if (cells.length >= 3) {
      if (/^\d{4}$/.test(cells[0]) && /^\d{4}$/.test(cells[1])) {
        return {
          regime: cells[0],
          serial: cells[1],
          wagonNo: cells[2],
        };
      }
      // Case B: serial (4 digits) + wagonNo + other...
      if (/^\d{4}$/.test(cells[0]) && isWagonNoCandidate(cells[1])) {
        return {
          regime: '',
          serial: cells[0],
          wagonNo: cells[1],
        };
      }
      // Case C: generic 3 columns
      return {
        regime: cells[0],
        serial: cells[1],
        wagonNo: cells[2],
      };
    }

    // 2 columns:
    if (cells.length === 2) {
      if (/^\d{4}$/.test(cells[0]) && isWagonNoCandidate(cells[1])) {
        return {
          regime: '',
          serial: cells[0],
          wagonNo: cells[1],
        };
      }
      const combined = parseFullWagonIdentity(`${cells[0]} ${cells[1]}`);
      if (combined) return combined;
    }
  }

  // Normalize dot to hyphen for wagon check digits (e.g. 213.8 -> 213-8)
  const normalizedClean = clean.replace(/\b(\d{3})\.(\d)\b/g, '$1-$2');

  // 2. Compact 12-digit / hyphenated / spaced full identity
  const fullIdentity = parseFullWagonIdentity(normalizedClean);
  if (fullIdentity) {
    return fullIdentity;
  }

  // 3. Free text parsing (e.g. "3175 2461 776-8 KAYSERİ 25,5" or "2461 776-8 KAYSERİ")
  const freeText = parseFreeText(normalizedClean);
  if (freeText && (freeText.serial || freeText.wagonNo)) {
    return {
      regime: freeText.regime || '',
      serial: freeText.serial || '',
      wagonNo: freeText.wagonNo || '',
    };
  }

  // 3b. Space-delimited line with prefix + serial + wagonNo (e.g. OCR lines like "175 4568 213-8 ÇORLU 4" or "M175 3302 603-5 REV.")
  const spaceTokens = normalizedClean.split(/\s+/);
  if (spaceTokens.length >= 2) {
    if (spaceTokens.length >= 3 && /^\d{4}$/.test(spaceTokens[1]) && isWagonNoCandidate(spaceTokens[2])) {
      const cleanPrefix = spaceTokens[0].replace(/[^0-9]/g, '');
      return {
        regime: cleanPrefix || spaceTokens[0],
        serial: spaceTokens[1],
        wagonNo: spaceTokens[2],
      };
    }
    if (/^\d{4}$/.test(spaceTokens[0]) && isWagonNoCandidate(spaceTokens[1])) {
      return {
        regime: '',
        serial: spaceTokens[0],
        wagonNo: spaceTokens[1],
      };
    }
  }

  // 4. Two-token serial + wagonNo candidate (e.g. "2461-776-8")
  const twoPartMatch = clean.match(/^(\d{4})[-\s]([0-9A-Za-z]+-[0-9A-Za-z]+)$/);
  if (twoPartMatch) {
    return {
      regime: '',
      serial: twoPartMatch[1],
      wagonNo: twoPartMatch[2],
    };
  }

  // 5. Fallback: return as raw wagonNo for user visibility and in-place correction
  return {
    regime: '',
    serial: '',
    wagonNo: clean,
  };
}

/**
 * Parses multi-line paste input for Dara calculations up to maxRows.
 */
export function parsePasteForDara(
  text: string,
  maxRows = 200
): { rows: DaraWagonInput[]; truncated: boolean; totalLinesFound: number } {
  if (!text || !text.trim()) {
    return { rows: [], truncated: false, totalLinesFound: 0 };
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsedInputs: DaraWagonInput[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isHeaderLine(line)) {
      continue;
    }

    const row = parseSingleDaraLine(line);
    if (row) {
      parsedInputs.push({
        id: `paste-${Date.now()}-${parsedInputs.length}-${Math.random().toString(36).substring(2, 7)}`,
        regime: row.regime || '',
        serial: row.serial || '',
        wagonNo: row.wagonNo || '',
        rawText: line,
        source: 'paste',
      });
    }
  }

  const totalLinesFound = parsedInputs.length;
  const truncated = totalLinesFound > maxRows;
  const rows = truncated ? parsedInputs.slice(0, maxRows) : parsedInputs;

  return { rows, truncated, totalLinesFound };
}

/**
 * Resolves a single wagon row against the canonical reference data.
 */
export function resolveWagonRow(
  input: DaraWagonInput,
  lookup: Record<string, WagonRecord>,
  seenKeys: Set<string>
): DaraWagonRow {
  const regime = cleanCell(input.regime);
  const serial = normalizeSerial(input.serial);
  const wagonNo = cleanCell(input.wagonNo);

  const isIncomplete = !serial || !wagonNo;

  let isDuplicate = false;
  if (!isIncomplete) {
    const identityKey = `${regime ? regime + '-' : ''}${serial}-${wagonNo}`.toUpperCase();
    if (seenKeys.has(identityKey)) {
      isDuplicate = true;
    } else {
      seenKeys.add(identityKey);
    }
  }

  const rec = serial ? lookup[serial] : undefined;
  const wagonType = rec?.vagon || '';
  const tare = rec ? parseTurkishFloat(rec.dara) : null;
  const axle = rec && rec.dingil != null ? Math.round(parseTurkishFloat(rec.dingil) || 0) : null;
  const length = rec ? parseTurkishFloat(rec.uzunluk) : null;

  let status: DaraRowStatus;
  let statusMessage: string | undefined;

  const checkValidation = validateUicCheckDigit(regime, serial, wagonNo);
  const confidenceWarning = input.confidenceWarning || checkValidation.warning;

  const isIncompleteRegime = Boolean(regime && regime.length < 4);

  if (isDuplicate) {
    status = 'duplicate';
    statusMessage = 'Mükerrer vagon kaydı (Hesaba dahil edilmedi)';
  } else if (isIncomplete) {
    status = 'incomplete';
    statusMessage = 'Eksik seri veya vagon numarası';
  } else if (!rec) {
    status = 'unknown_serial';
    statusMessage = `Kayıtlarda bulunmayan seri: ${serial}`;
  } else if (isIncompleteRegime) {
    status = 'incomplete';
    statusMessage = checkValidation.warning || `Eksik rejim numarası: ${regime} (Lütfen 4 haneye tamamlayın)`;
  } else {
    status = 'resolved';
    if (checkValidation.warning) {
      statusMessage = checkValidation.warning;
    }
  }

  return {
    id: input.id,
    regime,
    serial,
    wagonNo,
    rawText: input.rawText,
    source: input.source,
    wagonType,
    tare,
    axle,
    length,
    status,
    isDuplicate,
    statusMessage,
    confidence: input.confidence,
    confidenceWarning,
  };
}

export interface UicCheckResult {
  isValid: boolean | null;
  expectedCheckDigit?: number;
  actualCheckDigit?: number;
  warning?: string;
}

/**
 * Validates 12-digit railway wagon identity using standard UIC Modulo 10 (2-1-2-1-2-1-2-1-2-1-2 alternating weights).
 * If regime is missing, checks against standard domestic regimes.
 * Does NOT mutate digits; produces a non-destructive warning if mismatch is found.
 */
export function validateUicCheckDigit(
  regime: string,
  serial: string,
  wagonNo: string
): UicCheckResult {
  const reg = cleanCell(regime).replace(/\D/g, '');
  const ser = cleanCell(serial).replace(/\D/g, '');
  const wagonParts = cleanCell(wagonNo).split('-');
  const seq = wagonParts[0]?.replace(/\D/g, '') || '';
  const checkStr = wagonParts[1]?.replace(/\D/g, '') || '';

  if (!checkStr || checkStr.length !== 1) {
    return { isValid: null };
  }

  const actual = parseInt(checkStr, 10);

  // Partial / incomplete regime (< 4 digits)
  if (reg.length > 0 && reg.length < 4) {
    const candidateRegimes = ['3175', '2175', '8175', '6075', '5075', '8375', '2375', '4075'];
    const matchingCandidates: string[] = [];
    if (ser.length === 4 && seq.length === 3) {
      for (const r of candidateRegimes) {
        if (r.endsWith(reg)) {
          const full11 = r + ser + seq;
          let sum = 0;
          for (let i = 0; i < 11; i++) {
            const d = parseInt(full11[i], 10);
            const weight = i % 2 === 0 ? 2 : 1;
            const prod = d * weight;
            sum += prod >= 10 ? prod - 9 : prod;
          }
          const exp = (10 - (sum % 10)) % 10;
          if (exp === actual) {
            matchingCandidates.push(r);
          }
        }
      }
    }
    return {
      isValid: false,
      actualCheckDigit: actual,
      warning: `Eksik rejim: ${regime} (4 haneli olmalı${matchingCandidates.length > 0 ? `, olası: ${matchingCandidates.join(', ')}` : ''})`,
    };
  }

  // Full 11 digits (4 reg + 4 ser + 3 seq)
  if (reg.length === 4 && ser.length === 4 && seq.length === 3) {
    const full11 = reg + ser + seq;
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const d = parseInt(full11[i], 10);
      const weight = i % 2 === 0 ? 2 : 1;
      const prod = d * weight;
      sum += prod >= 10 ? prod - 9 : prod;
    }
    const expected = (10 - (sum % 10)) % 10;
    const isValid = expected === actual;
    return {
      isValid,
      expectedCheckDigit: expected,
      actualCheckDigit: actual,
      warning: isValid ? undefined : `Kontrol basamağı uyuşmuyor (Beklenen: ${expected}, Okunan: ${actual})`,
    };
  }

  // 4 ser + 3 seq (regime unknown/missing entirely)
  if (ser.length === 4 && seq.length === 3) {
    const candidateRegimes = ['3175', '2175', '8175', '6075', '5075', '8375', '2375', '4075'];
    let matchesAny = false;
    for (const r of candidateRegimes) {
      const full11 = r + ser + seq;
      let sum = 0;
      for (let i = 0; i < 11; i++) {
        const d = parseInt(full11[i], 10);
        const weight = i % 2 === 0 ? 2 : 1;
        const prod = d * weight;
        sum += prod >= 10 ? prod - 9 : prod;
      }
      const exp = (10 - (sum % 10)) % 10;
      if (exp === actual) {
        matchesAny = true;
        break;
      }
    }
    return {
      isValid: matchesAny,
      actualCheckDigit: actual,
      warning: matchesAny ? undefined : 'Kontrol basamağı standart rejimlerle uyuşmuyor',
    };
  }

  return { isValid: null };
}

/**
 * Resolves a batch of wagon inputs against canonical reference data, tracking duplicates.
 */
export function resolveWagonsForTare(
  inputs: DaraWagonInput[],
  lookup: Record<string, WagonRecord>
): DaraWagonRow[] {
  const seenKeys = new Set<string>();
  return inputs.map((input) => resolveWagonRow(input, lookup, seenKeys));
}

/**
 * Calculates tare and technical totals.
 * CRITICAL RULE: Sums ONLY non-duplicate rows with status === 'resolved'.
 */
export function calculateTareTotals(rows: DaraWagonRow[]): DaraTotals {
  let totalCount = rows.length;
  let resolvedCount = 0;
  let controlNeededCount = 0;
  let duplicateCount = 0;
  let totalTare = 0;
  let totalAxles = 0;
  let totalLength = 0;

  for (const row of rows) {
    if (row.isDuplicate) {
      duplicateCount++;
      controlNeededCount++;
      continue;
    }

    if (row.status === 'resolved') {
      resolvedCount++;
      if (row.tare != null) {
        totalTare += row.tare;
      }
      if (row.axle != null) {
        totalAxles += row.axle;
      }
      if (row.length != null) {
        totalLength += row.length;
      }
    } else {
      controlNeededCount++;
    }
  }

  return {
    totalCount,
    resolvedCount,
    controlNeededCount,
    duplicateCount,
    totalTare: Math.round(totalTare * 100) / 100,
    totalAxles,
    totalLength: Math.round(totalLength * 100) / 100,
  };
}

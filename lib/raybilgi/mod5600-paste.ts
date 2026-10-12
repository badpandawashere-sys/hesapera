import { WagonRowInput } from '@/types/raybilgi';

export interface ParsedWagonPatch {
  regime?: string;
  serial?: string;
  wagonNo?: string;
  departure?: string;
  arrival?: string;
  netInput?: string;
  confidence?: 'strong' | 'contextual' | 'ambiguous';
  skipReason?: string;
}

/** Alias for backward compatibility */
export type ParsedWagonRow = ParsedWagonPatch;

export type WagonLookup =
  | Record<string, unknown>
  | Set<string>
  | ((serial: string) => boolean);

export interface ParseRowContext {
  existingRow?: Partial<WagonRowInput>;
  wagonLookup?: WagonLookup;
}

export interface PasteResult {
  handled: boolean;
  newRows: WagonRowInput[];
  appliedCount: number;
  skippedCount: number;
  reachedCapacity: boolean;
}

/**
 * Cleans a cell string: trims, removes quotes, and strips trailing .0 for integer values.
 * Preserves text representation and leading zeroes.
 */
export function cleanCell(value: unknown): string {
  let val = String(value ?? '').trim();
  // Strip surrounding quotes if present
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1).trim();
  }
  // Strip .0 if numeric integer representation from Excel export
  if (val.endsWith('.0') && /^\d+$/.test(val.slice(0, -2))) {
    val = val.slice(0, -2);
  }
  return val;
}

/**
 * Checks if a serial is present in the provided wagon reference lookup.
 */
export function isKnownSerial(val: string, lookup?: WagonLookup): boolean {
  if (!val || !lookup) return false;
  const clean = cleanCell(val);
  if (typeof lookup === 'function') {
    return lookup(clean);
  }
  if (lookup instanceof Set) {
    return lookup.has(clean);
  }
  return Object.prototype.hasOwnProperty.call(lookup, clean) || Boolean(lookup[clean]);
}

/**
 * Checks if a value is a candidate wagon number (e.g. 776-8, 473-2, 262-5, 209-6, 183-2, W-24).
 * Matches check-digit hyphenated patterns while preserving exact representation.
 */
export function isWagonNoCandidate(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return /^[0-9A-Za-z]+-[0-9A-Za-z]+$/.test(trimmed);
}

/**
 * Checks if a value is a valid net ton candidate (e.g. 25, 25,5, 25.5, 0, 0,00, 42,3).
 * Must NOT match 4-digit serials or regimes (e.g. 3175, 2461).
 */
export function isNetTonCandidate(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  // Must match numeric representation with optional comma or dot decimal
  if (!/^\d+(?:[.,]\d+)?$/.test(trimmed)) return false;

  // If pure integer without decimal separator:
  if (/^\d+$/.test(trimmed)) {
    // 4-digit integers are serials or regimes (e.g. 3175, 2461), never net ton
    if (trimmed.length === 4) return false;
    const num = parseInt(trimmed, 10);
    // Typical freight payload range is 0 to 150 metric tons
    return num >= 0 && num <= 150;
  }

  // Decimal number with comma or dot (e.g. 25,5 or 25.5 or 0,00)
  const normalized = trimmed.replace(',', '.');
  const num = parseFloat(normalized);
  return !isNaN(num) && num >= 0 && num <= 150;
}

/**
 * Checks if a value is a non-numeric station candidate containing letters.
 */
export function isStationCandidate(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (isNetTonCandidate(trimmed)) return false;
  if (isWagonNoCandidate(trimmed)) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return /[a-zA-ZçÇğĞıİöÖşŞüÜ]/.test(trimmed);
}

/**
 * Parses a 12-digit / compact wagon number:
 * - 31752461776-8 -> regime: 3175, serial: 2461, wagonNo: 776-8
 * - 3175-2461-776-8 -> regime: 3175, serial: 2461, wagonNo: 776-8
 * - 3175 2461 776-8 -> regime: 3175, serial: 2461, wagonNo: 776-8
 * - 317545691832 -> regime: 3175, serial: 4569, wagonNo: 1832
 */
export function parseFullWagonIdentity(
  val: string
): { regime: string; serial: string; wagonNo: string } | null {
  const clean = cleanCell(val);
  const match = clean.match(/^(\d{4})[-\s]?(\d{4})[-\s]?([0-9A-Za-z]+-[0-9A-Za-z]+|\d{3,4})$/);
  if (match && match[3]) {
    return {
      regime: match[1],
      serial: match[2],
      wagonNo: match[3],
    };
  }
  return null;
}

/** Alias for backward compatibility */
export const parseSingleWagonNumber = parseFullWagonIdentity;

/**
 * Parses free-text single line containing wagon identity and optional station / net ton.
 * Follows strict priority order:
 * 1. Collapse repeated whitespace for token analysis
 * 2. Detect identity prefix:
 *    a. regime + serial + wagonNo (e.g. "3175 2461 776-8 ...")
 *    b. serial + wagonNo (e.g. "2461 776-8 ...", preserves existing regime)
 *    c. compact full wagon identity (e.g. "31752461776-8 ...")
 *    d. compact partial wagon identity (e.g. "2461-776-8 ...")
 * 3. After identity is removed: detect trailing net ton if present
 * 4. Remaining text between identity and net: ARRIVAL
 * 5. Preserve multi-word arrival by joining remaining tokens with spaces
 */
export function parseFreeText(
  rawText: string,
  context?: ParseRowContext
): ParsedWagonPatch | null {
  const text = cleanCell(rawText);
  if (!text) return null;

  // 1. Collapse repeated whitespace for token analysis
  const normalized = text.replace(/\s+/g, ' ').trim();
  const tokens = normalized.split(' ');

  let regime: string | undefined;
  let serial: string | undefined;
  let wagonNo: string | undefined;
  let remainingTokens: string[] = [];
  let identityMatched = false;

  // 2a. Priority A: regime + (4-digit serial) + wagonNo
  // e.g. "3175 2461 776-8 KAYSERİ 25,5" or "3175 2461 776-8 KAYSERİ"
  if (
    tokens.length >= 3 &&
    /^\d{4}$/.test(tokens[0]) &&
    /^\d{4}$/.test(tokens[1]) &&
    isWagonNoCandidate(tokens[2])
  ) {
    regime = tokens[0];
    serial = tokens[1];
    wagonNo = tokens[2];
    remainingTokens = tokens.slice(3);
    identityMatched = true;
  }
  // 2b. Priority B: (4-digit serial) + wagonNo (without regime)
  // e.g. "2461 776-8 KAYSERİ 25,5" or "2461 776-8 KAYSERİ" or "2461 776-8"
  else if (
    tokens.length >= 2 &&
    /^\d{4}$/.test(tokens[0]) &&
    isWagonNoCandidate(tokens[1])
  ) {
    // 2461 is serial, 776-8 is wagonNo. Regime is NOT set (keeps existing row regime)
    serial = tokens[0];
    wagonNo = tokens[1];
    remainingTokens = tokens.slice(2);
    identityMatched = true;
  }
  // 2c. Priority C: compact full wagon identity at tokens[0]
  // e.g. "31752461776-8 KAYSERİ 25,5" or "3175-2461-776-8 HAYDARPAŞA GAR 25,5"
  else {
    const compactFull = parseFullWagonIdentity(tokens[0]);
    if (compactFull) {
      regime = compactFull.regime;
      serial = compactFull.serial;
      wagonNo = compactFull.wagonNo;
      remainingTokens = tokens.slice(1);
      identityMatched = true;
    } else {
      // 2d. Priority D: compact partial wagon identity at tokens[0]
      // e.g. "2461-776-8 KAYSERİ 25,5"
      const compactPartialMatch = tokens[0].match(/^(\d{4})[-\s]?([0-9A-Za-z]+-[0-9A-Za-z]+)$/);
      if (compactPartialMatch) {
        serial = compactPartialMatch[1];
        wagonNo = compactPartialMatch[2];
        remainingTokens = tokens.slice(1);
        identityMatched = true;
      }
    }
  }

  // If identity was matched:
  if (identityMatched) {
    let arrival: string | undefined;
    let netInput: string | undefined;

    if (remainingTokens.length > 0) {
      const lastToken = remainingTokens[remainingTokens.length - 1];
      if (isNetTonCandidate(lastToken)) {
        netInput = lastToken;
        const arrivalTokens = remainingTokens.slice(0, -1);
        if (arrivalTokens.length > 0) {
          arrival = arrivalTokens.join(' ').toLocaleUpperCase('tr-TR');
        }
      } else {
        // All remaining tokens are arrival (e.g. "KAYSERİ" or "HAYDARPAŞA GAR")
        arrival = remainingTokens.join(' ').toLocaleUpperCase('tr-TR');
      }
    }

    return {
      ...(regime !== undefined ? { regime } : {}),
      ...(serial !== undefined ? { serial } : {}),
      ...(wagonNo !== undefined ? { wagonNo } : {}),
      ...(arrival !== undefined ? { arrival } : {}),
      ...(netInput !== undefined ? { netInput } : {}),
      confidence: 'strong',
    };
  }

  // If no identity prefix matched:
  // Check if it's Arrival + Net Ton only (e.g. "KAYSERİ 25,5" or "HAYDARPAŞA GAR 25,5"):
  if (tokens.length >= 2) {
    const lastToken = tokens[tokens.length - 1];
    if (isNetTonCandidate(lastToken)) {
      const arrivalTokens = tokens.slice(0, -1);
      const stationCandidate = arrivalTokens.join(' ');
      if (isStationCandidate(stationCandidate)) {
        return {
          arrival: stationCandidate.toLocaleUpperCase('tr-TR'),
          netInput: lastToken,
          confidence: 'contextual',
        };
      }
    }
  }

  // 4-digit serial only (e.g. "2461"):
  if (tokens.length === 1 && /^\d{4}$/.test(tokens[0])) {
    return {
      serial: tokens[0],
      confidence: 'contextual',
    };
  }

  return {
    confidence: 'ambiguous',
    skipReason: `Cannot safely interpret text: "${text}"`,
  };
}

/**
 * Parses tab-separated cells (1 to 6 cells) using content classification and positional hints.
 */
function parseTabCells(
  cells: string[],
  context?: ParseRowContext
): ParsedWagonPatch | null {
  if (cells.length === 0) return null;

  // 6 cells: REJİM | SERİ | VAGON NO | ÇIKIŞ | VARIŞ | NET TON
  if (cells.length >= 6) {
    return {
      regime: cells[0],
      serial: cells[1],
      wagonNo: cells[2],
      departure: cells[3].toLocaleUpperCase('tr-TR'),
      arrival: cells[4].toLocaleUpperCase('tr-TR'),
      netInput: cells[5] ?? '',
      confidence: 'strong',
    };
  }

  // 5 cells
  if (cells.length === 5) {
    const full = parseFullWagonIdentity(cells[0]);
    if (full) {
      return {
        ...full,
        departure: cells[1].toLocaleUpperCase('tr-TR'),
        arrival: cells[2].toLocaleUpperCase('tr-TR'),
        netInput: cells[3] ?? '',
        confidence: 'strong',
      };
    }
    // Standard 5 cells: REJİM | SERİ | VAGON NO | VARIŞ | NET TON
    return {
      regime: cells[0],
      serial: cells[1],
      wagonNo: cells[2],
      departure: '',
      arrival: cells[3] ? cells[3].toLocaleUpperCase('tr-TR') : '',
      netInput: cells[4] ?? '',
      confidence: 'strong',
    };
  }

  // 4 cells
  if (cells.length === 4) {
    const full = parseFullWagonIdentity(cells[0]);
    if (full) {
      if (isStationCandidate(cells[1]) && isStationCandidate(cells[2])) {
        return {
          ...full,
          departure: cells[1].toLocaleUpperCase('tr-TR'),
          arrival: cells[2].toLocaleUpperCase('tr-TR'),
          netInput: cells[3] ?? '',
          confidence: 'strong',
        };
      }
      return {
        ...full,
        arrival: cells[1] ? cells[1].toLocaleUpperCase('tr-TR') : '',
        netInput: cells[2] ?? '',
        confidence: 'strong',
      };
    }

    // If cell 1 is wagon number (e.g. 2461 | 776-8 | KAYSERİ | 25,5)
    if (isWagonNoCandidate(cells[1])) {
      return {
        serial: cells[0],
        wagonNo: cells[1],
        arrival: cells[2] ? cells[2].toLocaleUpperCase('tr-TR') : '',
        netInput: cells[3] ?? '',
        confidence: 'strong',
      };
    }

    // Standard 4 cells: REJİM | SERİ | VAGON NO | VARIŞ (or NET TON if numeric)
    if (isNetTonCandidate(cells[3])) {
      return {
        regime: cells[0],
        serial: cells[1],
        wagonNo: cells[2],
        netInput: cells[3],
        confidence: 'strong',
      };
    }
    return {
      regime: cells[0],
      serial: cells[1],
      wagonNo: cells[2],
      departure: '',
      arrival: cells[3] ? cells[3].toLocaleUpperCase('tr-TR') : '',
      netInput: '',
      confidence: 'strong',
    };
  }

  // 3 cells
  if (cells.length === 3) {
    const full = parseFullWagonIdentity(cells[0]);
    if (full) {
      // FULL_WAGON_ID | KAYSERİ | 25,5
      if (isStationCandidate(cells[1]) && isNetTonCandidate(cells[2])) {
        return {
          ...full,
          arrival: cells[1].toLocaleUpperCase('tr-TR'),
          netInput: cells[2],
          confidence: 'strong',
        };
      }
      if (isStationCandidate(cells[1]) && isStationCandidate(cells[2])) {
        return {
          ...full,
          departure: cells[1].toLocaleUpperCase('tr-TR'),
          arrival: cells[2].toLocaleUpperCase('tr-TR'),
          confidence: 'strong',
        };
      }
    }

    // If cell 1 is wagon number (e.g. 2461 | 776-8 | KAYSERİ or 2461 | 776-8 | 25,5)
    if (isWagonNoCandidate(cells[1])) {
      if (isNetTonCandidate(cells[2])) {
        return {
          serial: cells[0],
          wagonNo: cells[1],
          netInput: cells[2],
          confidence: 'strong',
        };
      }
      return {
        serial: cells[0],
        wagonNo: cells[1],
        arrival: cells[2] ? cells[2].toLocaleUpperCase('tr-TR') : '',
        confidence: 'strong',
      };
    }

    // Standard 3 cells: REJİM | SERİ | VAGON NO
    return {
      regime: cells[0],
      serial: cells[1],
      wagonNo: cells[2],
      confidence: 'strong',
    };
  }

  // 2 cells
  if (cells.length === 2) {
    const full = parseFullWagonIdentity(cells[0]);
    if (full) {
      if (isNetTonCandidate(cells[1])) {
        return {
          ...full,
          netInput: cells[1],
          confidence: 'strong',
        };
      }
      return {
        ...full,
        arrival: cells[1].toLocaleUpperCase('tr-TR'),
        confidence: 'strong',
      };
    }

    // 2461 | 776-8
    if (isWagonNoCandidate(cells[1])) {
      return {
        serial: cells[0],
        wagonNo: cells[1],
        confidence: 'strong',
      };
    }

    // KAYSERİ | 25,5
    if (isStationCandidate(cells[0]) && isNetTonCandidate(cells[1])) {
      return {
        arrival: cells[0].toLocaleUpperCase('tr-TR'),
        netInput: cells[1],
        confidence: 'contextual',
      };
    }

    // 2461 | 25,5
    if (/^\d{4}$/.test(cells[0]) && isNetTonCandidate(cells[1])) {
      return {
        serial: cells[0],
        netInput: cells[1],
        confidence: 'contextual',
      };
    }

    // 2461 | KAYSERİ
    if (/^\d{4}$/.test(cells[0]) && isStationCandidate(cells[1])) {
      return {
        serial: cells[0],
        arrival: cells[1].toLocaleUpperCase('tr-TR'),
        confidence: 'contextual',
      };
    }
  }

  // 1 cell
  return parseFreeText(cells[0], context);
}

/**
 * Parses a single clipboard line into wagon patch fields.
 */
export function parseWagonRowLine(
  rawLine: string,
  context?: ParseRowContext
): ParsedWagonPatch | null {
  const line = rawLine.replace(/\r/g, '').trim();
  if (!line) return null;

  if (line.includes('\t')) {
    const rawParts = line.split('\t').map(cleanCell);
    while (rawParts.length > 0 && rawParts[rawParts.length - 1] === '') {
      rawParts.pop();
    }
    if (rawParts.length === 0) return null;
    const patch = parseTabCells(rawParts, context);
    if (!patch || patch.confidence === 'ambiguous') return null;
    return patch;
  }

  const patch = parseFreeText(line, context);
  if (!patch || patch.confidence === 'ambiguous') return null;
  return patch;
}

/** Alias for backward compatibility */
export const parseClipboardRow = parseWagonRowLine;

/**
 * Determines whether clipboard text contains smart wagon data that should be intercepted,
 * or if it is a simple single-cell paste that should be handled natively by the browser.
 */
export function isSmartPaste(
  clipboardText: string,
  context?: ParseRowContext
): boolean {
  if (!clipboardText) return false;

  const normalized = clipboardText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) return false;

  // Multiple rows -> always handled
  if (lines.length > 1) {
    return true;
  }

  // Single row
  const line = lines[0];

  // Tab-separated cells -> always handled
  if (line.includes('\t')) return true;

  // Compact full wagon identity
  if (parseFullWagonIdentity(line) !== null) return true;

  // Check if line contains recognized wagon data (e.g. full ID, partial ID, arrival + net, etc.)
  const patch = parseFreeText(line, context);
  if (patch && patch.confidence !== 'ambiguous') {
    const fieldCount = [
      patch.regime,
      patch.serial,
      patch.wagonNo,
      patch.departure,
      patch.arrival,
      patch.netInput,
    ].filter(Boolean).length;
    // Intercept when at least 2 fields are recognized
    if (fieldCount >= 2) return true;
  }

  return false;
}

/** Alias for backward compatibility */
export const isBulkPaste = isSmartPaste;

/**
 * Parses bulk clipboard text and applies parsed wagon row patches starting from startRowIndex downward.
 * Implements patch semantics: fields not provided in a patch preserve the existing row values.
 * Automatically expands the table if more rows are needed (up to maxRows, default 49).
 */
export function parseAndApplyWagonPaste(
  clipboardText: string,
  startRowIndex: number,
  currentRows: WagonRowInput[],
  maxRows: number = 49,
  wagonLookup?: WagonLookup
): PasteResult {
  const isHandled = isSmartPaste(clipboardText, { wagonLookup });

  if (!isHandled) {
    return {
      handled: false,
      newRows: [...currentRows],
      appliedCount: 0,
      skippedCount: 0,
      reachedCapacity: false,
    };
  }

  const normalized = clipboardText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return {
      handled: false,
      newRows: [...currentRows],
      appliedCount: 0,
      skippedCount: 0,
      reachedCapacity: false,
    };
  }

  const validParsed: ParsedWagonPatch[] = [];
  let skippedCount = 0;
  const startIdx = Math.max(0, startRowIndex);

  for (let i = 0; i < lines.length; i++) {
    const targetIdx = startIdx + validParsed.length;
    const existingRow = currentRows[targetIdx] || undefined;
    const parsed = parseWagonRowLine(lines[i], { existingRow, wagonLookup });

    if (
      parsed &&
      parsed.confidence !== 'ambiguous' &&
      (parsed.regime ||
        parsed.serial ||
        parsed.wagonNo ||
        parsed.netInput !== undefined ||
        parsed.departure !== undefined ||
        parsed.arrival !== undefined)
    ) {
      validParsed.push(parsed);
    } else {
      skippedCount++;
    }
  }

  if (validParsed.length === 0) {
    return {
      handled: true,
      newRows: [...currentRows],
      appliedCount: 0,
      skippedCount,
      reachedCapacity: false,
    };
  }

  if (startIdx >= maxRows) {
    return {
      handled: true,
      newRows: [...currentRows],
      appliedCount: 0,
      skippedCount,
      reachedCapacity: true,
    };
  }

  // Determine needed row count (auto-expanding up to maxRows)
  const neededLength = Math.min(
    maxRows,
    Math.max(currentRows.length, startIdx + validParsed.length)
  );

  const newRows = [...currentRows];

  // Auto-grow table up to neededLength
  while (newRows.length < neededLength) {
    const nextIdx = newRows.length + 1;
    newRows.push({
      id: `row-${Date.now()}-${nextIdx}-${Math.random().toString(36).substring(2, 7)}`,
      regime: '',
      serial: '',
      wagonNo: '',
      departure: '',
      arrival: '',
      netInput: '',
    });
  }

  let appliedCount = 0;
  let reachedCapacity = false;

  for (let i = 0; i < validParsed.length; i++) {
    const targetIdx = startIdx + i;
    if (targetIdx >= maxRows) {
      reachedCapacity = true;
      break;
    }

    const patch = validParsed[i];
    // Exact REPLACEMENT semantics — NEVER concatenate existing + pasted!
    newRows[targetIdx] = {
      ...newRows[targetIdx],
      ...(patch.regime !== undefined && { regime: patch.regime }),
      ...(patch.serial !== undefined && { serial: patch.serial }),
      ...(patch.wagonNo !== undefined && { wagonNo: patch.wagonNo }),
      ...(patch.departure !== undefined && { departure: patch.departure }),
      ...(patch.arrival !== undefined && { arrival: patch.arrival }),
      ...(patch.netInput !== undefined && { netInput: patch.netInput }),
    };
    appliedCount++;
  }

  return {
    handled: true,
    newRows,
    appliedCount,
    skippedCount,
    reachedCapacity,
  };
}

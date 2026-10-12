import { WagonRowInput } from '@/types/raybilgi';

export interface ParsedWagonRow {
  regime?: string;
  serial?: string;
  wagonNo?: string;
  departure?: string;
  arrival?: string;
  netInput?: string;
}

export interface PasteResult {
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
 * Parses a single-value 12-digit / compact wagon number matching desktop regex:
 * ^(\d{4})[-\s]?(\d{4})[-\s]?(.*)$
 *
 * Example formats:
 * - 31754569183-2 -> regime: 3175, serial: 4569, wagonNo: 183-2
 * - 3175-4569-183-2 -> regime: 3175, serial: 4569, wagonNo: 183-2
 * - 3175 4569 183-2 -> regime: 3175, serial: 4569, wagonNo: 183-2
 * - 317545691832 -> regime: 3175, serial: 4569, wagonNo: 1832
 */
export function parseSingleWagonNumber(
  val: string
): { regime: string; serial: string; wagonNo: string } | null {
  const clean = cleanCell(val);
  const match = clean.match(/^(\d{4})[-\s]?(\d{4})[-\s]?([0-9A-Za-z-]+)$/);
  if (match && match[3]) {
    return {
      regime: match[1],
      serial: match[2],
      wagonNo: match[3],
    };
  }
  return null;
}

/**
 * Parses a single clipboard line into wagon fields.
 * Supports:
 * - 3 columns: regime | serial | wagonNo
 * - 4 columns: regime | serial | wagonNo | arrival
 * - 5 columns: regime | serial | wagonNo | arrival | netInput
 * - 6 columns: regime | serial | wagonNo | departure | arrival | netInput
 * - 1 column: 12-digit compact wagon number OR single serial
 */
export function parseWagonRowLine(rawLine: string): ParsedWagonRow | null {
  const line = rawLine.replace(/\r/g, '').trim();
  if (!line) return null;

  // 1. Tab-separated parsing (prioritized for Excel / HTML table copies)
  if (line.includes('\t')) {
    const rawParts = line.split('\t').map(cleanCell);
    // Remove trailing empty cells if any
    while (rawParts.length > 0 && rawParts[rawParts.length - 1] === '') {
      rawParts.pop();
    }
    if (rawParts.length === 0) return null;

    if (rawParts.length >= 6) {
      return {
        regime: rawParts[0],
        serial: rawParts[1],
        wagonNo: rawParts[2],
        departure: rawParts[3] ? rawParts[3].toLocaleUpperCase('tr-TR') : '',
        arrival: rawParts[4] ? rawParts[4].toLocaleUpperCase('tr-TR') : '',
        netInput: rawParts[5] ?? '',
      };
    }
    if (rawParts.length === 5) {
      return {
        regime: rawParts[0],
        serial: rawParts[1],
        wagonNo: rawParts[2],
        departure: '',
        arrival: rawParts[3] ? rawParts[3].toLocaleUpperCase('tr-TR') : '',
        netInput: rawParts[4] ?? '',
      };
    }
    if (rawParts.length === 4) {
      return {
        regime: rawParts[0],
        serial: rawParts[1],
        wagonNo: rawParts[2],
        departure: '',
        arrival: rawParts[3] ? rawParts[3].toLocaleUpperCase('tr-TR') : '',
        netInput: '',
      };
    }
    if (rawParts.length === 3) {
      return {
        regime: rawParts[0],
        serial: rawParts[1],
        wagonNo: rawParts[2],
      };
    }
    if (rawParts.length === 1 || rawParts.length === 2) {
      const single = parseSingleWagonNumber(rawParts[0]);
      if (single) {
        return {
          ...single,
          ...(rawParts[1] ? { netInput: rawParts[1] } : {}),
        };
      }
      if (rawParts[0]) {
        return {
          serial: rawParts[0],
          ...(rawParts[1] ? { netInput: rawParts[1] } : {}),
        };
      }
    }
    return null;
  }

  // 2. No tabs present. Check if it's a 12-digit / compact wagon number
  const single = parseSingleWagonNumber(line);
  if (single) {
    return single;
  }

  // 3. Fallback: whitespace-separated line
  const spaceParts = line.split(/\s+/).map(cleanCell).filter(Boolean);
  if (spaceParts.length >= 6) {
    return {
      regime: spaceParts[0],
      serial: spaceParts[1],
      wagonNo: spaceParts[2],
      departure: spaceParts[3] ? spaceParts[3].toLocaleUpperCase('tr-TR') : '',
      arrival: spaceParts[4] ? spaceParts[4].toLocaleUpperCase('tr-TR') : '',
      netInput: spaceParts[5] ?? '',
    };
  }
  if (spaceParts.length === 5) {
    return {
      regime: spaceParts[0],
      serial: spaceParts[1],
      wagonNo: spaceParts[2],
      departure: '',
      arrival: spaceParts[3] ? spaceParts[3].toLocaleUpperCase('tr-TR') : '',
      netInput: spaceParts[4] ?? '',
    };
  }
  if (spaceParts.length === 4) {
    return {
      regime: spaceParts[0],
      serial: spaceParts[1],
      wagonNo: spaceParts[2],
      departure: '',
      arrival: spaceParts[3] ? spaceParts[3].toLocaleUpperCase('tr-TR') : '',
      netInput: '',
    };
  }
  if (spaceParts.length === 3) {
    return {
      regime: spaceParts[0],
      serial: spaceParts[1],
      wagonNo: spaceParts[2],
    };
  }
  if (spaceParts.length === 1 && spaceParts[0]) {
    return {
      serial: spaceParts[0],
    };
  }

  return null;
}

/**
 * Determines whether clipboard text contains bulk wagon data that should be intercepted,
 * or if it is a simple single-cell paste that should be handled natively.
 */
export function isBulkPaste(clipboardText: string): boolean {
  if (!clipboardText) return false;

  const normalized = clipboardText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);

  // Multiple rows
  if (lines.length > 1) {
    return true;
  }

  // Single row with tabs
  if (lines.length === 1) {
    const line = lines[0];
    if (line.includes('\t')) return true;
    if (parseSingleWagonNumber(line) !== null) return true;
  }

  return false;
}

/**
 * Parses bulk clipboard text and applies parsed wagon rows starting from startRowIndex downward.
 * Automatically expands the table if more rows are needed (up to maxRows, default 49).
 */
export function parseAndApplyWagonPaste(
  clipboardText: string,
  startRowIndex: number,
  currentRows: WagonRowInput[],
  maxRows: number = 49
): PasteResult {
  const normalized = clipboardText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return {
      newRows: [...currentRows],
      appliedCount: 0,
      skippedCount: 0,
      reachedCapacity: false,
    };
  }

  const validParsed: ParsedWagonRow[] = [];
  let skippedCount = 0;

  for (const line of lines) {
    const parsed = parseWagonRowLine(line);
    if (
      parsed &&
      (parsed.regime ||
        parsed.serial ||
        parsed.wagonNo ||
        parsed.netInput ||
        parsed.departure ||
        parsed.arrival)
    ) {
      validParsed.push(parsed);
    } else {
      skippedCount++;
    }
  }

  if (validParsed.length === 0) {
    return {
      newRows: [...currentRows],
      appliedCount: 0,
      skippedCount,
      reachedCapacity: false,
    };
  }

  const startIdx = Math.max(0, startRowIndex);
  if (startIdx >= maxRows) {
    return {
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

    const item = validParsed[i];
    newRows[targetIdx] = {
      ...newRows[targetIdx],
      ...(item.regime !== undefined && { regime: item.regime }),
      ...(item.serial !== undefined && { serial: item.serial }),
      ...(item.wagonNo !== undefined && { wagonNo: item.wagonNo }),
      ...(item.departure !== undefined && { departure: item.departure }),
      ...(item.arrival !== undefined && { arrival: item.arrival }),
      ...(item.netInput !== undefined && { netInput: item.netInput }),
    };
    appliedCount++;
  }

  return {
    newRows,
    appliedCount,
    skippedCount,
    reachedCapacity,
  };
}

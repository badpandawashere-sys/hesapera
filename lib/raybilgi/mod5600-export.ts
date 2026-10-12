import 'server-only';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { WagonRecord, WagonRowCalculated, TrainTotals } from '@/types/raybilgi';
import { get5600WagonLookup } from './mod5600-reference';
import { calculateWagonRow, calculateTrainTotals, normalizeSerial } from './mod5600-engine';
import stationCodesJson from './station_codes.json';
import { normalizeTurkish } from './auth/server-auth';

export interface Export5600RowInput {
  regime?: string;
  serial?: string;
  wagonNo?: string;
  departure?: string;
  arrival?: string;
  netInput?: string;
}

export interface Export5600Data {
  trainNo?: string;
  departure?: string;
  arrival?: string;
  rows?: Export5600RowInput[];
}

export interface Generate5600Options {
  now?: Date;
  templatePath?: string;
  wagonLookup?: Record<string, WagonRecord>;
  stationCodes?: Record<string, string>;
}

export interface Generate5600Result {
  buffer: ExcelJS.Buffer;
  filename: string;
  totals: TrainTotals;
  validCount: number;
}

/**
 * Resolves station name to authoritative 4-digit station code.
 * Matches case-insensitively and Turkish-normalized.
 * Preserves leading zeroes (e.g. "0123").
 * Returns empty string if station name is not found, matching desktop behavior.
 */
export function resolveStationCode(
  stationName: string,
  stationCodesMap: Record<string, string>
): string {
  if (!stationName) return '';
  const trimmed = stationName.trim();
  const upper = trimmed.toUpperCase();
  const normalized = normalizeTurkish(trimmed);

  for (const [code, name] of Object.entries(stationCodesMap)) {
    if (name.trim().toUpperCase() === upper || normalizeTurkish(name) === normalized) {
      return String(code).trim();
    }
  }
  return '';
}

/**
 * Generates official 5600 XLSX output by loading and filling the authoritative
 * desktop template (data/raybilgi/raybilgi_5600_sablon.xlsx).
 */
export async function generate5600Xlsx(
  data: Export5600Data,
  options?: Generate5600Options
): Promise<Generate5600Result> {
  const wagonLookup = options?.wagonLookup ?? get5600WagonLookup();
  const stationCodes = options?.stationCodes ?? (stationCodesJson as Record<string, string>);

  const rawRows = data.rows ?? [];
  if (rawRows.length > 49) {
    throw new Error('En fazla 49 vagon eklenebilir.');
  }

  const trainNo = (data.trainNo ?? '').trim();
  const topDeparture = (data.departure ?? '').trim().toUpperCase();
  const topArrival = (data.arrival ?? '').trim().toUpperCase();

  // Desktop export skips invalid / non-lookup rows
  const validRows: WagonRowCalculated[] = [];
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const normSerial = normalizeSerial(row.serial);
    if (!normSerial || !wagonLookup[normSerial]) {
      continue;
    }

    const calculated = calculateWagonRow(
      {
        id: `row-${validRows.length + 1}`,
        regime: row.regime ?? '',
        serial: row.serial ?? '',
        wagonNo: row.wagonNo ?? '',
        departure: row.departure ?? '',
        arrival: row.arrival ?? '',
        netInput: row.netInput ?? '',
      },
      validRows.length + 1,
      wagonLookup,
      topDeparture,
      topArrival
    );

    if (calculated.isValid) {
      validRows.push(calculated);
    }
  }

  if (validRows.length === 0) {
    throw new Error('En az bir geçerli vagon girin.');
  }

  if (validRows.length > 49) {
    throw new Error('En fazla 49 vagon eklenebilir.');
  }

  const totals = calculateTrainTotals(validRows);

  const templatePath =
    options?.templatePath ??
    path.join(process.cwd(), 'data', 'raybilgi', 'raybilgi_5600_sablon.xlsx');

  if (!fs.existsSync(/*turbopackIgnore: true*/ templatePath)) {
    throw new Error(`5600 şablonu bulunamadı: ${templatePath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  // Keep only 5600M worksheet, matching desktop behavior
  for (const ws of [...workbook.worksheets]) {
    if (ws.name !== '5600M') {
      workbook.removeWorksheet(ws.id);
    }
  }

  const ws = workbook.getWorksheet('5600M');
  if (!ws) {
    throw new Error('Şablonda 5600M sayfası bulunamadı.');
  }

  // Top fields
  ws.getCell('I5').value = trainNo;

  // Europe/Istanbul local date
  const now = options?.now ?? new Date();
  const istanbulParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parseInt(istanbulParts.find((p) => p.type === 'year')!.value, 10);
  const month = parseInt(istanbulParts.find((p) => p.type === 'month')!.value, 10) - 1;
  const day = parseInt(istanbulParts.find((p) => p.type === 'day')!.value, 10);
  const localDate = new Date(Date.UTC(year, month, day));
  ws.getCell('Q6').value = localDate;

  // Station name and code mappings
  ws.getCell('C10').value = topDeparture;
  ws.getCell('G10').value = resolveStationCode(topDeparture, stationCodes);
  ws.getCell('I10').value = topArrival;
  ws.getCell('J10').value = resolveStationCode(topArrival, stationCodes);

  // Totals
  ws.getCell('R9').value = totals.totalLength;
  ws.getCell('R12').value = totals.totalAxle;
  ws.getCell('L13').value = totals.totalGross;
  ws.getCell('M13').value = totals.totalNet;
  ws.getCell('N13').value = totals.totalBrake;

  // Brake percent (O11) and required brake (P11)
  const rawPercent = ws.getCell('O11').value;
  const brakePercent = typeof rawPercent === 'number' ? rawPercent : 41.0;
  ws.getCell('O11').value = brakePercent;
  ws.getCell('P11').value = Math.ceil((totals.totalGross * brakePercent) / 100.0);

  // Clear writable wagon rows (16-64), preserving formatting and borders
  for (let rowIdx = 16; rowIdx <= 64; rowIdx++) {
    for (const col of ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'N', 'O', 'P', 'T']) {
      ws.getCell(`${col}${rowIdx}`).value = null;
    }
  }

  // Populate valid wagons starting at row 16
  validRows.forEach((item, index) => {
    const outRow = 16 + index;
    ws.getCell(`C${outRow}`).value = item.sira;
    ws.getCell(`D${outRow}`).value = item.axle;
    ws.getCell(`E${outRow}`).value = item.wagonType;
    ws.getCell(`F${outRow}`).value = item.regime;
    ws.getCell(`G${outRow}`).value = item.serial;
    ws.getCell(`H${outRow}`).value = item.wagonNo;
    ws.getCell(`I${outRow}`).value = '';
    ws.getCell(`J${outRow}`).value = item.departure;
    ws.getCell(`L${outRow}`).value = item.arrival;
    ws.getCell(`N${outRow}`).value = item.net;
    ws.getCell(`O${outRow}`).value = item.gross;
    ws.getCell(`P${outRow}`).value = item.brake;
    ws.getCell(`T${outRow}`).value = item.length;

    // Set font color to black for F, G, H matching desktop
    for (const col of ['F', 'G', 'H']) {
      const cell = ws.getCell(`${col}${outRow}`);
      cell.font = { ...cell.font, color: { argb: 'FF000000' } };
    }
  });

  // Calculation mode: manual
  workbook.calcProperties.fullCalcOnLoad = false;
  (workbook.calcProperties as any).calcMode = 'manual';

  const buffer = await workbook.xlsx.writeBuffer();

  const yyyymmdd = `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const trainPart = trainNo.replace(/[/\\?%*:|"<>]/g, '_') || 'Tren';
  const filename = `5600_${trainPart}_${yyyymmdd}.xlsx`;

  return {
    buffer,
    filename,
    totals,
    validCount: validRows.length,
  };
}

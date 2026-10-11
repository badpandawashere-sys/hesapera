import { WagonRecord, WagonRowInput, WagonRowCalculated, TrainTotals } from '@/types/raybilgi';

export function parseTurkishFloat(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const s = String(val).replace(',', '.').trim();
  if (s === '' || s === '—' || s === '-') return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

export function normalizeSerial(value: unknown): string {
  let val = String(value ?? '').trim();
  if (val.endsWith('.0') && /^\d+$/.test(val.slice(0, -2))) {
    val = val.slice(0, -2);
  }
  return val;
}

/**
 * Calculates a single wagon row based on input and technical reference data.
 */
export function calculateWagonRow(
  input: WagonRowInput,
  sira: number,
  lookup: Record<string, WagonRecord>,
  topDeparture: string,
  topArrival: string
): WagonRowCalculated {
  const serial = normalizeSerial(input.serial);
  const rec = serial ? lookup[serial] : undefined;
  const isValid = Boolean(rec);

  const hasInput = Boolean(
    input.regime.trim() ||
    input.serial.trim() ||
    input.wagonNo.trim() ||
    input.netInput.trim() ||
    input.departure.trim() ||
    input.arrival.trim()
  );

  const effectiveDeparture = (input.departure.trim() || topDeparture.trim()).toUpperCase();
  const effectiveArrival = (input.arrival.trim() || topArrival.trim()).toUpperCase();

  if (!rec) {
    return {
      sira,
      axle: null,
      regime: input.regime.trim(),
      serial: input.serial.trim(),
      wagonNo: input.wagonNo.trim(),
      wagonType: '',
      length: null,
      departure: effectiveDeparture,
      arrival: effectiveArrival,
      tare: null,
      net: parseTurkishFloat(input.netInput),
      gross: null,
      brake: null,
      isValid: false,
      hasInput,
    };
  }

  const tare = parseTurkishFloat(rec.dara);
  const netInputVal = parseTurkishFloat(input.netInput);
  const net = netInputVal !== null ? netInputVal : 0;
  const gross = tare !== null ? tare + net : null;

  const length = parseTurkishFloat(rec.uzunluk);
  const axleVal = parseTurkishFloat(rec.dingil);
  const axle = axleVal !== null ? Math.round(axleVal) : null;

  // Canonical brake calculation rule:
  // if fren_aralik exists:
  //    gross < fren_aralik  -> fren_bos
  //    gross >= fren_aralik -> fren_dolu
  // else:
  //    fren_dolu
  let brake: number | null = null;
  const threshold = parseTurkishFloat(rec.fren_aralik);
  const emptyBrake = parseTurkishFloat(rec.fren_bos);
  const loadedBrake = parseTurkishFloat(rec.fren_dolu);

  if (gross !== null) {
    if (threshold !== null) {
      brake = gross < threshold ? (emptyBrake ?? 0) : (loadedBrake ?? 0);
    } else {
      brake = loadedBrake ?? 0;
    }
  }

  return {
    sira,
    axle,
    regime: input.regime.trim(),
    serial,
    wagonNo: input.wagonNo.trim(),
    wagonType: String(rec.vagon || ''),
    length,
    departure: effectiveDeparture,
    arrival: effectiveArrival,
    tare,
    net: netInputVal,
    gross,
    brake,
    isValid: true,
    hasInput: true,
  };
}

/**
 * Calculates train totals for all valid wagons.
 */
export function calculateTrainTotals(rows: WagonRowCalculated[]): TrainTotals {
  const validRows = rows.filter((r) => r.isValid);

  let totalLength = 0;
  let totalNet = 0;
  let totalTare = 0;
  let totalGross = 0;
  let totalBrake = 0;
  let totalAxle = 0;

  for (const r of validRows) {
    totalLength += r.length ?? 0;
    totalNet += r.net ?? 0;
    totalTare += r.tare ?? 0;
    totalGross += r.gross ?? 0;
    totalBrake += r.brake ?? 0;
    totalAxle += r.axle ?? 0;
  }

  // Required brake: ceil(totalGross * 0.41)
  const requiredBrake = Math.ceil(totalGross * 0.41);

  return {
    totalLength,
    totalNet,
    totalTare,
    totalGross,
    totalBrake,
    wagonCount: validRows.length,
    totalAxle,
    requiredBrake,
  };
}

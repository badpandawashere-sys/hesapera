import 'server-only';
import fs from 'fs';
import path from 'path';
import { WagonRecord } from '@/types/raybilgi';

export function normalizeSerial(value: unknown): string {
  let val = String(value ?? '').trim();
  if (val.endsWith('.0') && /^\d+$/.test(val.slice(0, -2))) {
    val = val.slice(0, -2);
  }
  return val;
}

let cachedLookup: Record<string, WagonRecord> | null = null;
let cachedStationNames: string[] | null = null;

/**
 * Builds the canonical 5600 wagon reference lookup following strict precedence:
 * 1. vagon_data.json (base)
 * 2. TECH_DATA overrides (raybilgi_5600_tech_data.json)
 * 3. vagon_data_user.json overrides
 */
export function get5600WagonLookup(): Record<string, WagonRecord> {
  if (cachedLookup) {
    return cachedLookup;
  }

  const lookup: Record<string, WagonRecord> = {};

  try {
    // 1. Base vagon_data.json
    const vagonDataPath = path.join(process.cwd(), 'data', 'vagon_data.json');
    if (fs.existsSync(vagonDataPath)) {
      const vagonData: WagonRecord[] = JSON.parse(fs.readFileSync(vagonDataPath, 'utf-8'));
      for (const row of vagonData) {
        if (!row._is_user) {
          const serial = normalizeSerial(row.seri);
          if (serial) {
            lookup[serial] = { ...row };
          }
        }
      }
    }

    // 2. TECH_DATA overrides
    const techDataPath = path.join(process.cwd(), 'data', 'raybilgi_5600_tech_data.json');
    if (fs.existsSync(techDataPath)) {
      const techData: Record<string, WagonRecord> = JSON.parse(fs.readFileSync(techDataPath, 'utf-8'));
      for (const [key, val] of Object.entries(techData)) {
        const serial = normalizeSerial(key);
        if (serial) {
          lookup[serial] = { ...(lookup[serial] || {}), ...val, seri: serial };
        }
      }
    }

    // 3. User overrides from vagon_data_user.json
    const userPath = path.join(process.cwd(), 'data', 'vagon_data_user.json');
    if (fs.existsSync(userPath)) {
      const userRows: WagonRecord[] = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
      for (const row of userRows) {
        if (row._is_user) {
          const serial = normalizeSerial(row.seri);
          if (serial) {
            lookup[serial] = { ...(lookup[serial] || {}), ...row, seri: serial };
          }
        }
      }
    }
  } catch (err) {
    console.error('Error loading 5600 wagon reference data:', err);
  }

  cachedLookup = lookup;
  return lookup;
}

/**
 * Returns station names only (no station codes!)
 */
export function get5600StationNames(): string[] {
  if (cachedStationNames) {
    return cachedStationNames;
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'raybilgi_gvd_referans.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const parsed = JSON.parse(raw);
      const names: string[] = Array.from(new Set(Object.values(parsed.istasyon_kod || {})))
        .map((s) => String(s).trim().toUpperCase())
        .sort((a, b) => a.localeCompare(b, 'tr'));
      cachedStationNames = names;
      return names;
    }
  } catch (err) {
    console.error('Error loading station names for 5600:', err);
  }

  cachedStationNames = [];
  return [];
}

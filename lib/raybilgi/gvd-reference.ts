import 'server-only';
import fs from 'fs';
import path from 'path';

let cachedReferenceData: any = null;

export function getGvdReferenceData() {
  if (cachedReferenceData) {
    return cachedReferenceData;
  }

  const dataPath = path.join(process.cwd(), 'data', 'raybilgi_gvd_referans.json');
  
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(rawData);
    
    // We must NOT leak station codes to the client since they act as base passwords!
    // We only send a sorted array of station NAMES for autocomplete purposes.
    const stationNames = Array.from(new Set(Object.values(parsed.istasyon_kod || {}))).sort();
    
    // Esya codes can be sent as an array of objects { code, name }
    const esyaList = Object.entries(parsed.esya_kod || {}).map(([code, name]) => ({
      code,
      name: String(name)
    }));

    cachedReferenceData = {
      vagonTipleri: parsed.vagon_tipleri || [],
      stationNames,
      esyaList
    };

    return cachedReferenceData;
  } catch (error) {
    console.error("Failed to load reference data:", error);
    return {
      vagonTipleri: [],
      stationNames: [],
      esyaList: []
    };
  }
}

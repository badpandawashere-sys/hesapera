export type GvdStatus = 
  | 'Dolu Yük'
  | 'Boş Yük'
  | 'Dolmakta'
  | 'Boşalmakta'
  | 'Yedek'
  | 'Tamirlik'
  | 'Iskat'
  | 'Tescilsiz';

export interface GvdRecord {
  id: string;
  stationId: string; // The code of the station that owns this record
  stationName?: string;
  status: GvdStatus;
  
  // Required fields for all statuses
  count: number;
  
  // Conditionally required/visible fields
  wagonType?: string;
  arrivalStation?: string; // Varış
  notes?: string;
  
  // Load specific fields
  tonnage?: number | null; // Hamton
  itemCode?: string; // Eşya Kodu
  itemName?: string; // Eşya Adı
  customer?: string; // Müşteri
  
  createdAt: Date;
  updatedAt: Date;
}

export interface GvdHistoryRecord extends GvdRecord {
  originalRecordId: string;
  departedAt: Date;
}

// 5600 Tren Hareket Bildirimi Types
export interface WagonRecord {
  seri: string;
  vagon?: string;
  dingil?: number | null;
  dara?: number | string | null;
  tonaji?: number | string | null;
  uzunluk?: number | string | null;
  fren_bos?: number | null;
  fren_dolu?: number | null;
  fren_aralik?: number | null;
  rejim?: number | string | null;
  shp_idare?: number | string | null;
  _is_user?: boolean;
}

export interface WagonRowInput {
  id: string;
  regime: string;
  serial: string;
  wagonNo: string;
  departure: string;
  arrival: string;
  netInput: string;
}

export interface WagonRowCalculated {
  sira: number;
  axle: number | null;
  regime: string;
  serial: string;
  wagonNo: string;
  wagonType: string;
  length: number | null;
  departure: string;
  arrival: string;
  tare: number | null;
  net: number | null;
  gross: number | null;
  brake: number | null;
  isValid: boolean;
  hasInput: boolean;
}

export interface TrainTotals {
  totalLength: number;
  totalNet: number;
  totalTare: number;
  totalGross: number;
  totalBrake: number;
  wagonCount: number;
  totalAxle: number;
  requiredBrake: number;
}

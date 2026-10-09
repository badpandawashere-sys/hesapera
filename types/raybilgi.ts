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

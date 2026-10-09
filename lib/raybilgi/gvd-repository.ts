import 'server-only';
import { GvdRecord, GvdHistoryRecord, GvdStatus } from '@/types/raybilgi';

/**
 * GVD Repository Stub.
 * A production database is REQUIRED to implement these operations safely.
 * Currently, there is no database configured in Prisma for this project.
 */
export const GvdRepository = {
  async getActiveRecords(stationId: string): Promise<GvdRecord[]> {
    // Return empty array to allow UI to render empty state
    return [];
  },

  async getHistoryRecords(stationId: string): Promise<GvdHistoryRecord[]> {
    return [];
  },

  async createRecord(stationId: string, record: Omit<GvdRecord, 'id' | 'stationId' | 'createdAt' | 'updatedAt'>): Promise<GvdRecord> {
    throw new Error('GVD_DB_REQUIRED: Veritabanı kurulumu gereklidir.');
  },

  async updateRecord(stationId: string, id: string, updates: Partial<Omit<GvdRecord, 'id' | 'stationId' | 'createdAt' | 'updatedAt'>>): Promise<GvdRecord> {
    throw new Error('GVD_DB_REQUIRED: Veritabanı kurulumu gereklidir.');
  },

  async moveToHistory(stationId: string, ids: string[]): Promise<void> {
    throw new Error('GVD_DB_REQUIRED: Veritabanı kurulumu gereklidir.');
  }
};

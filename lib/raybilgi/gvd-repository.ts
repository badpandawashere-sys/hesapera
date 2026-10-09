import 'server-only';
import { GvdRecord, GvdHistoryRecord, GvdStatus } from '@/types/raybilgi';
import prisma from '@/lib/db/prisma';

function mapRecord(dbRecord: any): GvdRecord {
  return {
    id: dbRecord.id,
    stationId: dbRecord.stationCode,
    stationName: dbRecord.stationName,
    status: dbRecord.status as GvdStatus,
    count: dbRecord.count,
    wagonType: dbRecord.wagonType || undefined,
    tonnage: dbRecord.tonnage,
    itemCode: dbRecord.itemCode || undefined,
    itemName: dbRecord.itemName || undefined,
    customer: dbRecord.customer || undefined,
    arrivalStation: dbRecord.destinationName || undefined,
    notes: dbRecord.notes || undefined,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

function mapHistoryRecord(dbRecord: any): GvdHistoryRecord {
  return {
    ...mapRecord(dbRecord),
    originalRecordId: dbRecord.originalRecordId,
    departedAt: dbRecord.departedAt,
  };
}

export const GvdRepository = {
  async getActiveRecords(stationCode: string): Promise<GvdRecord[]> {
    const records = await prisma.gvdRecord.findMany({
      where: { stationCode },
      orderBy: { createdAt: 'asc' },
    });
    return records.map(mapRecord);
  },

  async getHistoryRecords(stationCode: string): Promise<GvdHistoryRecord[]> {
    const records = await prisma.gvdHistory.findMany({
      where: { stationCode },
      orderBy: { departedAt: 'desc' },
    });
    return records.map(mapHistoryRecord);
  },

  async createRecord(
    stationCode: string,
    stationName: string,
    record: Omit<GvdRecord, 'id' | 'stationId' | 'stationName' | 'createdAt' | 'updatedAt'>
  ): Promise<GvdRecord> {
    const dbRecord = await prisma.gvdRecord.create({
      data: {
        stationCode,
        stationName,
        status: record.status,
        count: record.count,
        wagonType: record.wagonType,
        tonnage: record.tonnage,
        itemCode: record.itemCode,
        itemName: record.itemName,
        customer: record.customer,
        destinationName: record.arrivalStation,
        notes: record.notes,
      },
    });
    return mapRecord(dbRecord);
  },

  async updateRecord(
    stationCode: string,
    id: string,
    updates: Partial<Omit<GvdRecord, 'id' | 'stationId' | 'stationName' | 'createdAt' | 'updatedAt'>>
  ): Promise<GvdRecord> {
    // We strictly use a where clause with both `id` AND `stationCode`
    // If the record doesn't belong to the station, it throws a Prisma error (P2025: Record to update not found).
    const dbRecord = await prisma.gvdRecord.update({
      where: {
        id,
        stationCode, // Enforce station scope!
      },
      data: {
        status: updates.status,
        count: updates.count,
        wagonType: updates.wagonType,
        tonnage: updates.tonnage,
        itemCode: updates.itemCode,
        itemName: updates.itemName,
        customer: updates.customer,
        destinationName: updates.arrivalStation,
        notes: updates.notes,
      },
    });
    return mapRecord(dbRecord);
  },

  async moveToHistory(stationCode: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    await prisma.$transaction(async (tx) => {
      // 1. Load records belonging to authenticated station
      const activeRecords = await tx.gvdRecord.findMany({
        where: {
          id: { in: ids },
          stationCode, // Enforce station scope!
        },
      });

      // 2. Confirm every requested ID belongs to that station
      if (activeRecords.length !== ids.length) {
        throw new Error('Bazı kayıtlar bulunamadı veya yetkiniz yok.');
      }

      // 3 & 4. Create corresponding GvdHistory rows with current timestamp
      const historyData = activeRecords.map((r) => ({
        originalRecordId: r.id,
        stationCode: r.stationCode,
        stationName: r.stationName,
        status: r.status,
        count: r.count,
        wagonType: r.wagonType,
        tonnage: r.tonnage,
        itemCode: r.itemCode,
        itemName: r.itemName,
        customer: r.customer,
        destinationCode: r.destinationCode,
        destinationName: r.destinationName,
        shipmentDate: r.shipmentDate,
        notes: r.notes,
        repairType: r.repairType,
        workplace: r.workplace,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        // departedAt will default to now() automatically
      }));

      await tx.gvdHistory.createMany({
        data: historyData,
      });

      // 5. Delete active rows
      await tx.gvdRecord.deleteMany({
        where: {
          id: { in: ids },
          stationCode,
        },
      });
    });
  },
};

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
    const isLoad = record.status === 'Dolu Yük';
    const isFilling = record.status === 'Dolmakta';
    const isUnloading = record.status === 'Boşalmakta';

    const showTonnage = isLoad;
    const showItem = isLoad || isFilling;
    const showCustomer = isLoad || isFilling || isUnloading;

    let arrival = record.arrivalStation || null;
    if (arrival) arrival = arrival.toUpperCase();

    const dbRecord = await prisma.gvdRecord.create({
      data: {
        stationCode,
        stationName,
        status: record.status,
        count: record.count,
        wagonType: record.wagonType || null,
        tonnage: showTonnage ? (record.tonnage ?? null) : null,
        itemCode: showItem ? (record.itemCode || null) : null,
        itemName: showItem ? (record.itemName || null) : null,
        customer: showCustomer ? (record.customer || null) : null,
        destinationName: arrival,
        notes: record.notes || null,
      },
    });
    return mapRecord(dbRecord);
  },

  async updateRecord(
    stationCode: string,
    id: string,
    updates: Partial<Omit<GvdRecord, 'id' | 'stationId' | 'stationName' | 'createdAt' | 'updatedAt'>>
  ): Promise<GvdRecord> {
    const existing = await prisma.gvdRecord.findUnique({
      where: { id, stationCode }
    });
    
    if (!existing) {
      throw new Error("Kayt bulunamad.");
    }

    const targetStatus = updates.status || existing.status;
    const isLoad = targetStatus === 'Dolu Yük';
    const isFilling = targetStatus === 'Dolmakta';
    const isUnloading = targetStatus === 'Boşalmakta';

    const showTonnage = isLoad;
    const showItem = isLoad || isFilling;
    const showCustomer = isLoad || isFilling || isUnloading;

    const nextCount = updates.count ?? existing.count;
    const nextWagonType = updates.wagonType !== undefined ? updates.wagonType : existing.wagonType;
    const nextTonnage = updates.tonnage !== undefined ? updates.tonnage : existing.tonnage;
    const nextItemCode = updates.itemCode !== undefined ? updates.itemCode : existing.itemCode;
    const nextItemName = updates.itemName !== undefined ? updates.itemName : existing.itemName;
    const nextCustomer = updates.customer !== undefined ? updates.customer : existing.customer;
    let nextArrival = updates.arrivalStation !== undefined ? updates.arrivalStation : existing.destinationName;
    const nextNotes = updates.notes !== undefined ? updates.notes : existing.notes;

    if (nextArrival) {
      nextArrival = nextArrival.toUpperCase();
    }

    const dbRecord = await prisma.gvdRecord.update({
      where: {
        id,
        stationCode, // Enforce station scope!
      },
      data: {
        status: targetStatus,
        count: nextCount,
        wagonType: nextWagonType || null,
        tonnage: showTonnage ? (nextTonnage ?? null) : null,
        itemCode: showItem ? (nextItemCode || null) : null,
        itemName: showItem ? (nextItemName || null) : null,
        customer: showCustomer ? (nextCustomer || null) : null,
        destinationName: nextArrival || null,
        notes: nextNotes || null,
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

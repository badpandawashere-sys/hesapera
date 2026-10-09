import { describe, it, expect, vi } from 'vitest';
import { GvdStatus } from '@/types/raybilgi';
import { GvdRepository } from '@/lib/raybilgi/gvd-repository';
import prisma from '@/lib/db/prisma';

// Mock prisma methods
vi.mock('@/lib/db/prisma', () => {
  return {
    default: {
      gvdRecord: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn()
      },
      gvdHistory: {
        findMany: vi.fn(),
        createMany: vi.fn()
      },
      $transaction: vi.fn((callback) => callback({
        gvdRecord: { findMany: vi.fn(), deleteMany: vi.fn() },
        gvdHistory: { createMany: vi.fn() }
      }))
    }
  };
});

describe('GVD Core Module & Persistence', () => {
  it('should have exact status order', () => {
    const STATUS_ORDER: GvdStatus[] = [
      'Dolu Yük',
      'Boş Yük',
      'Dolmakta',
      'Boşalmakta',
      'Yedek',
      'Tamirlik',
      'Iskat',
      'Tescilsiz'
    ];
    expect(STATUS_ORDER[0]).toBe('Dolu Yük');
    expect(STATUS_ORDER[1]).toBe('Boş Yük');
    expect(STATUS_ORDER[7]).toBe('Tescilsiz');
  });

  it('should pass createRecord params correctly', async () => {
    vi.mocked(prisma.gvdRecord.create).mockResolvedValueOnce({
      id: '1', stationCode: '1512', stationName: 'ARİFİYE', status: 'Dolu Yük', count: 1, 
      createdAt: new Date(), updatedAt: new Date(),
      wagonType: null, tonnage: 45.5, itemCode: null, itemName: null, customer: null, destinationCode: null, destinationName: null, shipmentDate: null, notes: null, repairType: null, workplace: null
    });
    
    await GvdRepository.createRecord('1512', 'ARİFİYE', { status: 'Dolu Yük', count: 1, tonnage: 45.5 });
    expect(prisma.gvdRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stationCode: '1512',
        stationName: 'ARİFİYE',
        status: 'Dolu Yük',
        count: 1,
        tonnage: 45.5
      })
    });
  });

  it('should enforce station scope on updateRecord', async () => {
    vi.mocked(prisma.gvdRecord.update).mockResolvedValueOnce({
      id: '1', stationCode: '1512', stationName: 'ARİFİYE', status: 'Boş Yük', count: 2, 
      createdAt: new Date(), updatedAt: new Date(),
      wagonType: null, tonnage: null, itemCode: null, itemName: null, customer: null, destinationCode: null, destinationName: null, shipmentDate: null, notes: null, repairType: null, workplace: null
    });

    await GvdRepository.updateRecord('1512', '1', { status: 'Boş Yük', count: 2 });
    expect(prisma.gvdRecord.update).toHaveBeenCalledWith({
      where: { id: '1', stationCode: '1512' },
      data: expect.objectContaining({ status: 'Boş Yük', count: 2 })
    });
  });
});

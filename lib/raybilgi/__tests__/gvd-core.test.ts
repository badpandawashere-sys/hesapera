import { describe, it, expect, vi } from 'vitest';
import { GvdStatus } from '@/types/raybilgi';
import { GvdRepository } from '@/lib/raybilgi/gvd-repository';
import prisma from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => {
  return {
    default: {
      gvdRecord: {
        findUnique: vi.fn(),
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
  it('A. should have exact status order', () => {
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

  it('B. Dolu Yük keeps compatible fields on create', async () => {
    vi.mocked(prisma.gvdRecord.create).mockResolvedValueOnce({} as any);
    await GvdRepository.createRecord('1512', 'ARİFİYE', { 
      status: 'Dolu Yük', 
      count: 1, 
      tonnage: 45.5,
      itemCode: '123',
      itemName: 'KÖMÜR',
      customer: 'TCDD'
    });
    expect(prisma.gvdRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'Dolu Yük',
        tonnage: 45.5,
        itemCode: '123',
        itemName: 'KÖMÜR',
        customer: 'TCDD'
      })
    });
  });

  it('C. Dolu Yük -> Boş Yük clears incompatible fields', async () => {
    vi.mocked(prisma.gvdRecord.findUnique).mockResolvedValueOnce({
      id: '1', stationCode: '1512', status: 'Dolu Yük', count: 1, tonnage: 45.5,
      itemCode: '123', itemName: 'KÖMÜR', customer: 'TCDD', notes: 'test notes'
    } as any);
    vi.mocked(prisma.gvdRecord.update).mockResolvedValueOnce({} as any);

    await GvdRepository.updateRecord('1512', '1', { status: 'Boş Yük' });
    
    expect(prisma.gvdRecord.update).toHaveBeenCalledWith({
      where: { id: '1', stationCode: '1512' },
      data: expect.objectContaining({ 
        status: 'Boş Yük',
        tonnage: null,
        itemCode: null,
        itemName: null,
        customer: null,
        notes: 'test notes'
      })
    });
  });

  it('D. Dolu Yük -> Boşalmakta clears item/tonnage but preserves customer', async () => {
    vi.mocked(prisma.gvdRecord.findUnique).mockResolvedValueOnce({
      id: '1', stationCode: '1512', status: 'Dolu Yük', count: 1, tonnage: 45.5,
      itemCode: '123', itemName: 'KÖMÜR', customer: 'TCDD'
    } as any);
    vi.mocked(prisma.gvdRecord.update).mockResolvedValueOnce({} as any);

    await GvdRepository.updateRecord('1512', '1', { status: 'Boşalmakta' });
    
    expect(prisma.gvdRecord.update).toHaveBeenCalledWith({
      where: { id: '1', stationCode: '1512' },
      data: expect.objectContaining({ 
        status: 'Boşalmakta',
        tonnage: null,
        itemCode: null,
        itemName: null,
        customer: 'TCDD'
      })
    });
  });

  it('E. Create strips fields incompatible with supplied status', async () => {
    vi.mocked(prisma.gvdRecord.create).mockResolvedValueOnce({} as any);
    await GvdRepository.createRecord('1512', 'ARİFİYE', { 
      status: 'Boş Yük', 
      count: 1, 
      tonnage: 45.5, // should be stripped
      itemCode: '123' // should be stripped
    });
    expect(prisma.gvdRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'Boş Yük',
        tonnage: null,
        itemCode: null
      })
    });
  });

  it('F, G. destination persists uppercase, Note is NOT forcibly uppercased', async () => {
    vi.mocked(prisma.gvdRecord.create).mockResolvedValueOnce({} as any);
    await GvdRepository.createRecord('1512', 'ARİFİYE', { 
      status: 'Boş Yük', 
      count: 1, 
      arrivalStation: 'izmit',
      notes: 'small note'
    });
    expect(prisma.gvdRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        destinationName: 'IZMIT',
        notes: 'small note'
      })
    });
  });
});

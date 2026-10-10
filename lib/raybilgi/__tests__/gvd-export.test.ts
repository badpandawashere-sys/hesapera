import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/raybilgi/gvd-export/route';
import { getSession } from '@/lib/raybilgi/auth/session';
import { GvdRepository } from '@/lib/raybilgi/gvd-repository';
import ExcelJS from 'exceljs';

vi.mock('@/lib/raybilgi/auth/session', () => ({
  getSession: vi.fn()
}));

vi.mock('@/lib/raybilgi/gvd-repository', () => ({
  GvdRepository: {
    getActiveRecords: vi.fn()
  }
}));

describe('GVD Excel Export (Phase 2B)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('A. requires authentication and uses station scope', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const response = await GET();
    expect(response.status).toBe(401);

    vi.mocked(getSession).mockResolvedValueOnce({ stationCode: '1512', stationName: 'ARİFİYE', expiresAt: new Date() });
    vi.mocked(GvdRepository.getActiveRecords).mockResolvedValueOnce([]);
    
    await GET();
    expect(GvdRepository.getActiveRecords).toHaveBeenCalledWith('1512');
  });

  it('I. returns correct filename', async () => {
    vi.mocked(getSession).mockResolvedValueOnce({ stationCode: '1512', stationName: 'ARİFİYE', expiresAt: new Date() });
    vi.mocked(GvdRepository.getActiveRecords).mockResolvedValueOnce([]);
    const response = await GET();
    
    const yyyymmddParts = new Intl.DateTimeFormat('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Istanbul' }).formatToParts(new Date());
    const yyyymmdd = `${yyyymmddParts.find(p => p.type === 'year')?.value}${yyyymmddParts.find(p => p.type === 'month')?.value}${yyyymmddParts.find(p => p.type === 'day')?.value}`;
    const expectedFilename = `ARİFİYE_gvd_${yyyymmdd}.xlsx`;
    const cd = response.headers.get('content-disposition');
    expect(cd).toContain(encodeURIComponent(expectedFilename));
  });

  it('L. generates valid workbook with correct headers, grouping, styling, and data types', async () => {
    vi.mocked(getSession).mockResolvedValueOnce({ stationCode: '1512', stationName: 'ARİFİYE', expiresAt: new Date() });
    
    vi.mocked(GvdRepository.getActiveRecords).mockResolvedValueOnce([
      { status: 'Dolu Yük', count: 1, wagonType: 'E', tonnage: 50, itemCode: '010', itemName: 'KÖMÜR', customer: 'TCDD', arrivalStation: 'İZMİT', notes: 'Test' },
      { status: 'Boş Yük', count: 2, wagonType: 'FAS', tonnage: null, itemCode: null, itemName: null, customer: null, arrivalStation: 'DERİNCE', notes: null }
    ] as any);

    const response = await GET();
    const buffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('GVD')!;
    
    expect(sheet.getCell('A1').value).toBe('ARİFİYE — GVD');
    expect(sheet.getCell('A2').value).toMatch(/Tarih:/);
    
    const headers = sheet.getRow(4).values as string[];
    expect(headers).toEqual([undefined, 'Statü', 'Adet', 'Seri', 'Tonaj', 'Eşya Kodu', 'Eşya Adı', 'Müşteri', 'Varış', 'Not']);
    
    expect(sheet.getCell('A5').value).toBe('Dolu Yük');
    expect(sheet.getCell('A6').value).toBeNull();
    expect(sheet.getCell('A7').value).toBe('Boş Yük');
    
    expect(typeof sheet.getCell('B5').value).toBe('number');
    expect(typeof sheet.getCell('D5').value).toBe('number');
    
    const itemCell = sheet.getCell('E5');
    expect(itemCell.value).toBe('010');
    expect(itemCell.numFmt).toBe('@'); 
    
    expect(sheet.getCell('D7').value).toBe('');
    expect(sheet.getCell('E7').value).toBe('');
  });
});

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/raybilgi/auth/session';
import { GvdRepository } from '@/lib/raybilgi/gvd-repository';
import ExcelJS from 'exceljs';
import { GvdStatus } from '@/types/raybilgi';

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

const STATUS_FILLS: Record<string, string> = {
  'Dolu Yük': 'EAF4EA',
  'Boş Yük': 'EAF2F8',
  'Dolmakta': 'FFF8E1',
  'Boşalmakta': 'FFF0E6',
  'Yedek': 'F1F3F4',
  'Tamirlik': 'FCECEC',
  'Iskat': 'F3EAF7',
  'Tescilsiz': 'F5EFE5'
};

export async function GET() {
  const session = await getSession();
  if (!session || !session.stationCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { stationCode, stationName } = session;
  const records = await GvdRepository.getActiveRecords(stationCode);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('GVD');

  sheet.pageSetup.orientation = 'landscape';
  sheet.pageSetup.fitToPage = true;
  sheet.pageSetup.fitToWidth = 1;
  sheet.pageSetup.fitToHeight = 0;

  sheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 4, activeCell: 'A5' }
  ];

  sheet.columns = [
    { key: 'status', width: 16 },
    { key: 'count', width: 9 },
    { key: 'wagonType', width: 12 },
    { key: 'tonnage', width: 12 },
    { key: 'itemCode', width: 14 },
    { key: 'itemName', width: 32 },
    { key: 'customer', width: 26 },
    { key: 'arrivalStation', width: 22 },
    { key: 'notes', width: 34 }
  ];

  sheet.mergeCells('A1:I1');
  const titleRow = sheet.getRow(1);
  titleRow.height = 32;
  const titleCell = sheet.getCell('A1');
  titleCell.value = `${stationName} — GVD`;
  titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2540' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A2:I2');
  const dateRow = sheet.getRow(2);
  dateRow.height = 22;
  const dateCell = sheet.getCell('A2');
  const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Istanbul' });
  dateCell.value = `Tarih: ${todayStr}`;
  dateCell.font = { italic: true, color: { argb: 'FF5A6872' } };
  dateCell.alignment = { horizontal: 'left', vertical: 'middle' };

  const headers = ['Statü', 'Adet', 'Seri', 'Tonaj', 'Eşya Kodu', 'Eşya Adı', 'Müşteri', 'Varış', 'Not'];
  const headerRow = sheet.getRow(4);
  headerRow.values = headers;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2540' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFD6DEE3' } } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  sheet.autoFilter = 'A4:I4';

  let currentRow = 5;
  let isFirstGroup = true;

  for (const status of STATUS_ORDER) {
    const groupRecords = records.filter(r => r.status === status);
    if (groupRecords.length === 0) continue;

    if (!isFirstGroup) {
      currentRow++; 
    }
    isFirstGroup = false;

    const fillArgb = 'FF' + (STATUS_FILLS[status] || 'FFFFFF');

    for (const r of groupRecords) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = r.status;
      row.getCell(2).value = r.count;
      row.getCell(3).value = r.wagonType || '';
      row.getCell(4).value = r.tonnage !== null ? r.tonnage : '';
      row.getCell(5).value = r.itemCode || '';
      row.getCell(6).value = r.itemName || '';
      row.getCell(7).value = r.customer || '';
      row.getCell(8).value = r.arrivalStation || '';
      row.getCell(9).value = r.notes || '';

      row.eachCell((cell, colNumber) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFD6DEE3' } } };
        if (colNumber === 5 && r.itemCode) {
          cell.numFmt = '@';
        }
      });
      row.height = 23;
      currentRow++;
    }
  }

  const yyyymmddParts = new Intl.DateTimeFormat('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Istanbul' }).formatToParts(new Date());
  const yyyymmdd = `${yyyymmddParts.find(p => p.type === 'year')?.value}${yyyymmddParts.find(p => p.type === 'month')?.value}${yyyymmddParts.find(p => p.type === 'day')?.value}`;
  const filename = `${stationName}_gvd_${yyyymmdd}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Disposition': `attachment; filename="gvd_export.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`, 
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  });
}
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
    { key: 'status', width: 15 },
    { key: 'count', width: 8 },
    { key: 'wagonType', width: 12 },
    { key: 'tonnage', width: 10 },
    { key: 'itemCode', width: 15 },
    { key: 'itemName', width: 30 },
    { key: 'customer', width: 25 },
    { key: 'arrivalStation', width: 20 },
    { key: 'notes', width: 30 }
  ];

  sheet.mergeCells('A1:I1');
  const titleRow = sheet.getRow(1);
  titleRow.height = 30;
  const titleCell = sheet.getCell('A1');
  titleCell.value = `${stationName} — GVD`;
  titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2540' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('A2:I2');
  const dateRow = sheet.getRow(2);
  const dateCell = sheet.getCell('A2');
  const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  dateCell.value = `Tarih: ${todayStr}`;
  dateCell.font = { italic: true, color: { argb: 'FF5A6872' } };
  dateCell.alignment = { horizontal: 'left', vertical: 'middle' };

  const headers = ['Statü', 'Adet', 'Seri', 'Tonaj', 'Eşya Kodu', 'Eşya Adı', 'Müşteri', 'Varış', 'Not'];
  const headerRow = sheet.getRow(4);
  headerRow.values = headers;
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
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
      currentRow++;
    }
  }

  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${stationName}_gvd_${yyyymmdd}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  });
}
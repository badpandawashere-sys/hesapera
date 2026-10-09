'use client';

import { GvdHistoryRecord } from '@/types/raybilgi';

export function GvdHistoryTable({ records }: { records: GvdHistoryRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="p-8 text-center border border-border/60 bg-card rounded-2xl">
        <p className="text-muted-foreground">Bu istasyon için henüz Gidenler kaydı bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Çıkış Tarihi</th>
              <th className="px-4 py-3 font-semibold">Statü</th>
              <th className="px-4 py-3 font-semibold">Adet</th>
              <th className="px-4 py-3 font-semibold">Vagon Tipi</th>
              <th className="px-4 py-3 font-semibold">Tonaj</th>
              <th className="px-4 py-3 font-semibold">Eşya</th>
              <th className="px-4 py-3 font-semibold">Varış</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(r.departedAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 font-medium">{r.count}</td>
                <td className="px-4 py-3">{r.wagonType}</td>
                <td className="px-4 py-3">{r.tonnage}</td>
                <td className="px-4 py-3 truncate max-w-[150px]">{r.itemName || r.itemCode}</td>
                <td className="px-4 py-3 truncate max-w-[150px]">{r.arrivalStation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

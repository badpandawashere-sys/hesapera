'use client';

import { GvdRecord, GvdStatus } from '@/types/raybilgi';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  records: GvdRecord[];
  status: GvdStatus;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onEdit: (record: GvdRecord) => void;
}

export function GvdTable({ records, status, selectedIds, onSelectionChange, onEdit }: Props) {
  // Determine visible columns based on status
  const isLoad = status === 'Dolu Yük';
  const isFilling = status === 'Dolmakta';
  const isUnloading = status === 'Boşalmakta';
  
  const showTonnage = isLoad;
  const showItem = isLoad || isFilling;
  const showCustomer = isLoad || isFilling || isUnloading;
  
  // Tamirlik vs Iskat etc might have different fields in the future, 
  // but according to the source, others use simple_fields.
  const showNotes = isLoad || isUnloading || (!isLoad && !isFilling && !isUnloading); // simple_fields has Not

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(records.map(r => r.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  if (records.length === 0) {
    return (
      <div className="p-8 text-center border border-border/60 bg-card rounded-2xl">
        <p className="text-muted-foreground">Bu statüde henüz GVD kaydı bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border/60">
            <tr>
              <th className="px-4 py-3 w-[40px]">
                <Checkbox 
                  checked={records.length > 0 && selectedIds.size === records.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Tümünü seç"
                />
              </th>
              <th className="px-4 py-3 font-semibold w-[60px]">İşlem</th>
              <th className="px-4 py-3 font-semibold">Adet</th>
              <th className="px-4 py-3 font-semibold">Vagon Tipi</th>
              {showTonnage && <th className="px-4 py-3 font-semibold">Tonaj</th>}
              {showItem && <th className="px-4 py-3 font-semibold">Eşya Kodu</th>}
              {showItem && <th className="px-4 py-3 font-semibold">Eşya Adı</th>}
              {showCustomer && <th className="px-4 py-3 font-semibold">Müşteri</th>}
              <th className="px-4 py-3 font-semibold">Varış</th>
              {showNotes && <th className="px-4 py-3 font-semibold">Not</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Checkbox 
                    checked={selectedIds.has(r.id)}
                    onCheckedChange={(c) => handleSelectOne(r.id, !!c)}
                    aria-label={`${r.id} seç`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(r)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
                <td className="px-4 py-3 font-medium">{r.count}</td>
                <td className="px-4 py-3">{r.wagonType}</td>
                {showTonnage && <td className="px-4 py-3">{r.tonnage}</td>}
                {showItem && <td className="px-4 py-3 text-muted-foreground">{r.itemCode}</td>}
                {showItem && <td className="px-4 py-3 truncate max-w-[200px]" title={r.itemName}>{r.itemName}</td>}
                {showCustomer && <td className="px-4 py-3 truncate max-w-[150px]">{r.customer}</td>}
                <td className="px-4 py-3">{r.arrivalStation}</td>
                {showNotes && <td className="px-4 py-3 truncate max-w-[200px] text-muted-foreground" title={r.notes}>{r.notes}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

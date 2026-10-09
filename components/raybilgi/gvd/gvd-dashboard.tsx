'use client';

import { useState } from 'react';
import { GvdRecord, GvdStatus } from '@/types/raybilgi';
import { Button } from '@/components/ui/button';
import { Plus, Archive } from 'lucide-react';
import { GvdStatusSummary } from './gvd-status-summary';
import { GvdTable } from './gvd-table';
import { GvdRecordDialog } from './gvd-record-dialog';
import { moveRecordsToHistoryAction } from '@/lib/raybilgi/gvd-actions';

interface GvdDashboardProps {
  initialRecords: GvdRecord[];
  referenceData: any;
}

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

export function GvdDashboard({ initialRecords, referenceData }: GvdDashboardProps) {
  // Use local state for optimistic updates since we don't have a real DB yet
  const [records, setRecords] = useState<GvdRecord[]>(initialRecords);
  const [selectedStatus, setSelectedStatus] = useState<GvdStatus>('Dolu Yük');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GvdRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter records by selected status
  const filteredRecords = records.filter(r => r.status === selectedStatus);

  const handleOpenNew = () => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (record: GvdRecord) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleMoveToHistory = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Seçili ${selectedIds.size} kayıt Gidenler'e taşınacak. Onaylıyor musunuz?`)) {
      return;
    }

    const idsArray = Array.from(selectedIds);
    const result = await moveRecordsToHistoryAction(idsArray);
    
    if (result.success) {
      // Optimistic update
      setRecords(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      alert(`${idsArray.length} kayıt Gidenler'e taşındı.`);
    } else {
      // For now, since DB is not connected, we simulate success or show the error
      alert(result.error || "Hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      <GvdStatusSummary 
        records={records} 
        selectedStatus={selectedStatus} 
        onSelectStatus={setSelectedStatus} 
        statusOrder={STATUS_ORDER}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {selectedStatus} Kayıtları ({filteredRecords.length})
        </h2>
        
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="outline" className="text-muted-foreground hover:text-foreground gap-2" onClick={handleMoveToHistory}>
              <Archive className="w-4 h-4" />
              Gidenlere Taşı ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleOpenNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Kayıt
          </Button>
        </div>
      </div>

      <GvdTable 
        records={filteredRecords} 
        status={selectedStatus} 
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleOpenEdit}
      />

      <GvdRecordDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        record={editingRecord}
        defaultStatus={selectedStatus}
        referenceData={referenceData}
      />
    </div>
  );
}

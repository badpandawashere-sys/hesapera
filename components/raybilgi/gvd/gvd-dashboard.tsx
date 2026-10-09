'use client';

import { useState } from 'react';
import { GvdRecord, GvdHistoryRecord, GvdStatus } from '@/types/raybilgi';
import { Button } from '@/components/ui/button';
import { Plus, Archive, RefreshCw } from 'lucide-react';
import { GvdStatusSummary } from './gvd-status-summary';
import { GvdTable } from './gvd-table';
import { GvdHistoryTable } from './gvd-history-table';
import { GvdRecordDialog } from './gvd-record-dialog';
import { moveRecordsToHistoryAction } from '@/lib/raybilgi/gvd-actions';
import { useRouter } from 'next/navigation';

interface GvdDashboardProps {
  initialRecords: GvdRecord[];
  initialHistory: GvdHistoryRecord[];
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

type Tab = 'active' | 'history';

export function GvdDashboard({ initialRecords, initialHistory, referenceData }: GvdDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');
  const [selectedStatus, setSelectedStatus] = useState<GvdStatus>('Dolu Yük');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GvdRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter records by selected status
  const filteredRecords = initialRecords.filter(r => r.status === selectedStatus);

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
      setSelectedIds(new Set());
      alert(`${idsArray.length} kayıt Gidenler'e taşındı.`);
      router.refresh();
    } else {
      alert(result.error || "Hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setTab('active')}
          className={`pb-2 px-4 text-sm font-semibold transition-colors ${tab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Aktif GVD
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-2 px-4 text-sm font-semibold transition-colors ${tab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Gidenler (Arşiv)
        </button>
      </div>

      {tab === 'active' && (
        <>
          <GvdStatusSummary 
            records={initialRecords} 
            selectedStatus={selectedStatus} 
            onSelectStatus={setSelectedStatus} 
            statusOrder={STATUS_ORDER}
          />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              {selectedStatus} Kayıtları ({filteredRecords.length})
            </h2>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.refresh()} className="px-2" title="Yenile">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </Button>
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
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Gidenler ({initialHistory.length})
            </h2>
            <Button variant="ghost" onClick={() => router.refresh()} className="px-2" title="Yenile">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <GvdHistoryTable records={initialHistory} />
        </div>
      )}

      <GvdRecordDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        record={editingRecord}
        defaultStatus={selectedStatus}
        referenceData={referenceData}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

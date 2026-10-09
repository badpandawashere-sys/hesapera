'use client';

import { GvdRecord, GvdStatus } from '@/types/raybilgi';
import { cn } from '@/lib/utils';

interface Props {
  records: GvdRecord[];
  selectedStatus: GvdStatus;
  onSelectStatus: (status: GvdStatus) => void;
  statusOrder: GvdStatus[];
}

export function GvdStatusSummary({ records, selectedStatus, onSelectStatus, statusOrder }: Props) {
  // Compute counts
  const counts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + r.count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-wrap gap-2">
      {statusOrder.map((status) => {
        const count = counts[status] || 0;
        const isSelected = status === selectedStatus;
        
        return (
          <button
            key={status}
            onClick={() => onSelectStatus(status)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
              isSelected 
                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                : "bg-card text-card-foreground border-border/60 hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            <span className="font-semibold">{status}</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              isSelected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

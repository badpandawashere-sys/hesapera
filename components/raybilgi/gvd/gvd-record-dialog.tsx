'use client';

import { useEffect, useState } from 'react';
import { GvdRecord, GvdStatus } from '@/types/raybilgi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGvdRecordAction, updateGvdRecordAction } from '@/lib/raybilgi/gvd-actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: GvdRecord | null;
  defaultStatus: GvdStatus;
  referenceData: any;
  onSuccess?: () => void;
}

const STATUS_ORDER: GvdStatus[] = [
  'Dolu Yük', 'Boş Yük', 'Dolmakta', 'Boşalmakta',
  'Yedek', 'Tamirlik', 'Iskat', 'Tescilsiz'
];

export function GvdRecordDialog({ open, onOpenChange, record, defaultStatus, referenceData, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<GvdStatus>(defaultStatus);
  const [count, setCount] = useState('1');
  const [wagonType, setWagonType] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [customer, setCustomer] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      if (record) {
        setStatus(record.status);
        setCount(record.count.toString());
        setWagonType(record.wagonType || '');
        setTonnage(record.tonnage ? record.tonnage.toString() : '');
        setItemCode(record.itemCode || '');
        setItemName(record.itemName || '');
        setCustomer(record.customer || '');
        setArrivalStation(record.arrivalStation || '');
        setNotes(record.notes || '');
      } else {
        setStatus(defaultStatus);
        setCount('1');
        setWagonType('');
        setTonnage('');
        setItemCode('');
        setItemName('');
        setCustomer('');
        setArrivalStation('');
        setNotes('');
      }
    }
  }, [open, record, defaultStatus]);

  if (!open) return null;

  // Derived visibility
  const isLoad = status === 'Dolu Yük';
  const isFilling = status === 'Dolmakta';
  const isUnloading = status === 'Boşalmakta';

  const showTonnage = isLoad;
  const showItem = isLoad || isFilling;
  const showCustomer = isLoad || isFilling || isUnloading;
  const showNotes = isLoad || isUnloading || (!isLoad && !isFilling && !isUnloading);

  const handleItemCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setItemCode(val);
    if (referenceData?.esyaList) {
      const match = referenceData.esyaList.find((x: any) => x.code === val);
      if (match) {
        setItemName(match.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const parsedCount = parseInt(count, 10);
    if (isNaN(parsedCount) || parsedCount < 1) {
      alert('Adet en az 1 olmalıdır.');
      setIsSubmitting(false);
      return;
    }

    let parsedTonnage: number | null = null;
    if (isLoad) {
      if (!tonnage.trim()) {
        alert('Dolu Yük için Tonaj zorunludur.');
        setIsSubmitting(false);
        return;
      }
      parsedTonnage = parseFloat(tonnage.replace(',', '.'));
      if (isNaN(parsedTonnage) || parsedTonnage < 0) {
        alert('Tonaj geçerli ve sıfırdan büyük olmalıdır.');
        setIsSubmitting(false);
        return;
      }
    }

    const data: any = {
      status,
      count: parsedCount,
      wagonType,
      arrivalStation,
    };

    if (showTonnage) data.tonnage = parsedTonnage;
    if (showItem) {
      data.itemCode = itemCode;
      data.itemName = itemName;
    }
    if (showCustomer) data.customer = customer;
    if (showNotes) data.notes = notes;

    let res;
    if (record) {
      res = await updateGvdRecordAction(record.id, data);
    } else {
      res = await createGvdRecordAction(data);
    }

    setIsSubmitting(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert(record ? 'Kayıt güncellendi.' : 'Yeni kayıt eklendi.');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-lg border border-border/60 flex flex-col">
        <div className="px-6 py-4 border-b border-border/60">
          <h2 className="text-lg font-bold">{record ? 'GVD Kaydını Düzenle' : 'Yeni GVD Kaydı'}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statü</Label>
                <Select value={status} onValueChange={(v: any) => { if (v) setStatus(v as GvdStatus); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Adet *</Label>
                <Input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vagon Tipi</Label>
                <Input list="vagonTipleri" value={wagonType} onChange={e => setWagonType(e.target.value)} placeholder="Örn: E, FAS" />
                <datalist id="vagonTipleri">
                  {referenceData?.vagonTipleri?.map((v: string) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Varış</Label>
                <Input list="istasyonlar" value={arrivalStation} onChange={e => setArrivalStation(e.target.value)} />
                <datalist id="istasyonlar">
                  {referenceData?.stationNames?.map((s: string) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            {showTonnage && (
              <div className="space-y-2">
                <Label>Tonaj *</Label>
                <Input type="text" value={tonnage} onChange={e => setTonnage(e.target.value)} placeholder="0.00" required />
              </div>
            )}

            {showItem && (
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label>Eşya Kodu</Label>
                  <Input value={itemCode} onChange={handleItemCodeChange} placeholder="Kod" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Eşya Adı</Label>
                  <Input value={itemName} onChange={e => setItemName(e.target.value)} />
                </div>
              </div>
            )}

            {showCustomer && (
              <div className="space-y-2">
                <Label>Müşteri</Label>
                <Input value={customer} onChange={e => setCustomer(e.target.value)} />
              </div>
            )}

            {showNotes && (
              <div className="space-y-2">
                <Label>Not</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-border/60 flex justify-end gap-2 bg-muted/20">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

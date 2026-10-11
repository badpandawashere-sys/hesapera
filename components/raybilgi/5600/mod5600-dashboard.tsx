'use client';

import React, { useState, useMemo } from 'react';
import { WagonRecord, WagonRowInput } from '@/types/raybilgi';
import { calculateWagonRow, calculateTrainTotals } from '@/lib/raybilgi/mod5600-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, TrainTrack, Scale, Gauge, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Mod5600DashboardProps {
  stationNames: string[];
  wagonLookup: Record<string, WagonRecord>;
  initialDate?: string;
}

const MAX_WAGONS = 49;
const INITIAL_ROW_COUNT = 10;

function createEmptyRow(index: number): WagonRowInput {
  return {
    id: `row-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    regime: '',
    serial: '',
    wagonNo: '',
    departure: '',
    arrival: '',
    netInput: '',
  };
}

export function Mod5600Dashboard({
  stationNames,
  wagonLookup,
  initialDate,
}: Mod5600DashboardProps) {
  // Top-level trip info
  const [trainNo, setTrainNo] = useState('');
  const [date] = useState(
    initialDate ||
      new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
  );
  const [topDeparture, setTopDeparture] = useState('');
  const [topArrival, setTopArrival] = useState('');

  // Rows state (starts with 10 rows)
  const [rows, setRows] = useState<WagonRowInput[]>(() =>
    Array.from({ length: INITIAL_ROW_COUNT }, (_, i) => createEmptyRow(i + 1))
  );

  // Live row calculation
  const calculatedRows = useMemo(() => {
    return rows.map((row, idx) =>
      calculateWagonRow(row, idx + 1, wagonLookup, topDeparture, topArrival)
    );
  }, [rows, wagonLookup, topDeparture, topArrival]);

  // Train totals
  const totals = useMemo(() => {
    return calculateTrainTotals(calculatedRows);
  }, [calculatedRows]);

  const handleUpdateRow = (index: number, field: keyof WagonRowInput, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRow = () => {
    if (rows.length >= MAX_WAGONS) return;
    setRows((prev) => [...prev, createEmptyRow(prev.length + 1)]);
  };

  const handleRemoveTrailingEmpty = () => {
    setRows((prev) => {
      // Find the last index that has user input
      let lastFilledIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        const r = prev[i];
        if (
          r.regime.trim() ||
          r.serial.trim() ||
          r.wagonNo.trim() ||
          r.departure.trim() ||
          r.arrival.trim() ||
          r.netInput.trim()
        ) {
          lastFilledIdx = i;
          break;
        }
      }
      // If all are empty, keep at least 1
      const keepCount = Math.max(1, lastFilledIdx + 1);
      return prev.slice(0, keepCount);
    });
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden Datalist for Station Autocomplete */}
      <datalist id="station-options">
        {stationNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Sefer Bilgileri Formu */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrainTrack className="w-5 h-5 text-primary" />
          Sefer Bilgileri
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Tren No
            </label>
            <Input
              type="text"
              placeholder="Örn: 23215"
              value={trainNo}
              onChange={(e) => setTrainNo(e.target.value)}
              className="font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Tarih (Otomatik)
            </label>
            <Input
              type="text"
              readOnly
              value={date}
              className="bg-muted/50 cursor-not-allowed font-medium text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Çıkış İstasyonu
            </label>
            <Input
              type="text"
              list="station-options"
              placeholder="İstasyon adı seçin..."
              value={topDeparture}
              onChange={(e) => setTopDeparture(e.target.value.toUpperCase())}
              className="font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Varış İstasyonu
            </label>
            <Input
              type="text"
              list="station-options"
              placeholder="İstasyon adı seçin..."
              value={topArrival}
              onChange={(e) => setTopArrival(e.target.value.toUpperCase())}
              className="font-medium"
            />
          </div>
        </div>
      </div>

      {/* Özet Toplam Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground">TOPLAM UZUNLUK</span>
          <span className="text-xl font-bold text-foreground">
            {formatNumber(totals.totalLength)} <span className="text-xs font-normal">m</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground">TOPLAM NET</span>
          <span className="text-xl font-bold text-foreground">
            {formatNumber(totals.totalNet)} <span className="text-xs font-normal">ton</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground">TOPLAM DARA</span>
          <span className="text-xl font-bold text-foreground">
            {formatNumber(totals.totalTare)} <span className="text-xs font-normal">ton</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground">TOPLAM BRÜT</span>
          <span className="text-xl font-bold text-foreground">
            {formatNumber(totals.totalGross)} <span className="text-xs font-normal">ton</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground">TOPLAM FREN</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatNumber(totals.totalBrake)} <span className="text-xs font-normal">ton</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            GEREKLİ FREN (%41)
          </span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {totals.requiredBrake} <span className="text-xs font-normal">ton</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <span className="block text-xs font-semibold text-muted-foreground">VAGON / DİNGİL</span>
          <span className="text-xl font-bold text-foreground">
            {totals.wagonCount} <span className="text-xs font-normal">({totals.totalAxle} d.)</span>
          </span>
        </div>
      </div>

      {/* Dizideki Vagonlar Tablosu */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Dizideki Vagonlar ({rows.length} / {MAX_WAGONS})
            </h2>
            <p className="text-xs text-muted-foreground">
              Vagon serisini girdiğinizde dingil, tip, dara ve fren ağırlıkları otomatik hesaplanır.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveTrailingEmpty}
              title="Kullanılmayan boş satırları sil"
              className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Boş Satırları Temizle
            </Button>

            <Button
              size="sm"
              onClick={handleAddRow}
              disabled={rows.length >= MAX_WAGONS}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Satır Ekle
            </Button>
          </div>
        </div>

        {/* Tablo Kapsayıcısı (Masaüstü ve Yatay Kaydırma) */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-muted/70 text-muted-foreground font-semibold border-b border-border text-center">
                <th className="py-2.5 px-2 w-12">SIRA</th>
                <th className="py-2.5 px-2 w-16">DİNGİL</th>
                <th className="py-2.5 px-2 w-20">3175</th>
                <th className="py-2.5 px-2 w-24">SERİ</th>
                <th className="py-2.5 px-2 w-28">VAGON NO</th>
                <th className="py-2.5 px-2 w-24">VAGON TİPİ</th>
                <th className="py-2.5 px-2 w-20">UZUNLUK</th>
                <th className="py-2.5 px-2 w-32">ÇIKIŞ</th>
                <th className="py-2.5 px-2 w-32">VARIŞ</th>
                <th className="py-2.5 px-2 w-20">DARA</th>
                <th className="py-2.5 px-2 w-24">NET TON</th>
                <th className="py-2.5 px-2 w-20">BRÜT TON</th>
                <th className="py-2.5 px-2 w-20">FREN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {calculatedRows.map((calc, idx) => {
                const input = rows[idx];
                const isInvalid = !calc.isValid && calc.hasInput;

                return (
                  <tr
                    key={input.id}
                    className={`transition-colors ${
                      calc.isValid
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                        : isInvalid
                        ? 'bg-rose-500/10 hover:bg-rose-500/15'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    {/* Sıra */}
                    <td className="py-2 px-2 text-center font-bold text-muted-foreground">
                      {calc.sira}
                    </td>

                    {/* Dingil */}
                    <td className="py-2 px-2 text-center font-semibold text-foreground">
                      {calc.axle !== null ? calc.axle : '—'}
                    </td>

                    {/* 3175 / Rejim */}
                    <td className="py-1 px-1">
                      <Input
                        type="text"
                        value={input.regime}
                        placeholder="3175"
                        onChange={(e) => handleUpdateRow(idx, 'regime', e.target.value)}
                        className="h-8 text-center text-xs px-1 font-medium"
                      />
                    </td>

                    {/* Seri */}
                    <td className="py-1 px-1 relative">
                      <Input
                        type="text"
                        value={input.serial}
                        placeholder="Örn: 5379"
                        onChange={(e) => handleUpdateRow(idx, 'serial', e.target.value)}
                        className={`h-8 text-center text-xs px-1 font-bold ${
                          isInvalid
                            ? 'border-rose-500 text-rose-600 focus-visible:ring-rose-500'
                            : calc.isValid
                            ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                            : ''
                        }`}
                      />
                      {isInvalid && (
                        <span
                          title="Seri veritabanında bulunamadı"
                          className="absolute right-2 top-2.5 text-rose-500"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {calc.isValid && (
                        <span
                          title="Geçerli vagon"
                          className="absolute right-2 top-2.5 text-emerald-500"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    {/* Vagon No */}
                    <td className="py-1 px-1">
                      <Input
                        type="text"
                        value={input.wagonNo}
                        placeholder="183-2"
                        onChange={(e) => handleUpdateRow(idx, 'wagonNo', e.target.value)}
                        className="h-8 text-center text-xs px-1 font-medium"
                      />
                    </td>

                    {/* Vagon Tipi */}
                    <td className="py-2 px-2 text-center font-semibold text-foreground">
                      {calc.wagonType || '—'}
                    </td>

                    {/* Uzunluk */}
                    <td className="py-2 px-2 text-center text-foreground font-medium">
                      {calc.length !== null ? `${calc.length} m` : '—'}
                    </td>

                    {/* Çıkış İstasyonu */}
                    <td className="py-1 px-1">
                      <Input
                        type="text"
                        list="station-options"
                        value={input.departure}
                        placeholder={topDeparture || 'Çıkış...'}
                        onChange={(e) => handleUpdateRow(idx, 'departure', e.target.value.toUpperCase())}
                        className="h-8 text-center text-xs px-1 font-medium"
                      />
                    </td>

                    {/* Varış İstasyonu */}
                    <td className="py-1 px-1">
                      <Input
                        type="text"
                        list="station-options"
                        value={input.arrival}
                        placeholder={topArrival || 'Varış...'}
                        onChange={(e) => handleUpdateRow(idx, 'arrival', e.target.value.toUpperCase())}
                        className="h-8 text-center text-xs px-1 font-medium"
                      />
                    </td>

                    {/* Dara */}
                    <td className="py-2 px-2 text-center text-foreground font-medium">
                      {calc.tare !== null ? `${calc.tare} t` : '—'}
                    </td>

                    {/* Net Ton */}
                    <td className="py-1 px-1">
                      <Input
                        type="text"
                        value={input.netInput}
                        placeholder="0.00"
                        onChange={(e) => handleUpdateRow(idx, 'netInput', e.target.value)}
                        className="h-8 text-center text-xs px-1 font-medium"
                      />
                    </td>

                    {/* Brüt Ton */}
                    <td className="py-2 px-2 text-center font-bold text-foreground">
                      {calc.gross !== null ? `${formatNumber(calc.gross)} t` : '—'}
                    </td>

                    {/* Fren */}
                    <td className="py-2 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {calc.brake !== null ? `${calc.brake} t` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, CheckCircle2, ClipboardCopy, ListChecks, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import {
  buildCopyPayload,
  DEFAULT_SAHA_LAYOUT,
  parseThbfPages,
  reverseRows,
  SAHA_LAYOUTS,
  selectedInOrder,
  type SahaLayout,
  type ThbfRow,
} from '@/lib/raybilgi/thbf';
import { extractThbfPages, ThbfPdfError } from '@/lib/raybilgi/thbf-pdf';

type Notice = { kind: 'error' | 'success' | 'info'; text: string } | null;

const WORKER_SRC = '/pdfjs/pdf.worker.min.js';

async function loadPdfjs() {
  // Yalnız tarayıcıda, ihtiyaç anında yüklenir. Worker aynı origin'den gelir.
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC;
  return pdfjs as unknown as Parameters<typeof extractThbfPages>[0];
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function ThbfParser() {
  const [rows, setRows] = useState<ThbfRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [layout, setLayout] = useState<SahaLayout>(DEFAULT_SAHA_LAYOUT);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [ignoredGray, setIgnoredGray] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!isPdf(file)) {
      setNotice({ kind: 'error', text: 'Yalnızca PDF dosyası yükleyebilirsiniz.' });
      return;
    }
    setLoading(true);
    setNotice(null);
    setWarnings([]);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdfjs = await loadPdfjs();
      const pages = await extractThbfPages(pdfjs, data);
      const result = parseThbfPages(pages);
      setRows(result.rows);
      setSelected(new Set());
      setWarnings(result.warnings);
      setIgnoredGray(result.ignoredGrayCount);
      if (result.rows.length === 0) {
        setNotice({ kind: 'error', text: 'THBF vagon satırı bulunamadı.' });
      } else {
        setNotice({ kind: 'success', text: `${result.rows.length} vagon çözümlendi.` });
      }
    } catch (err) {
      setRows([]);
      setSelected(new Set());
      setNotice({
        kind: 'error',
        text: err instanceof ThbfPdfError ? err.message : 'PDF çözümlenemedi. Lütfen geçerli bir THBF PDF dosyası seçin.',
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copy = async (onlySelected: boolean) => {
    if (rows.length === 0) {
      setNotice({ kind: 'error', text: 'Önce bir THBF PDF dosyası yükleyin.' });
      return;
    }
    const source = onlySelected ? selectedInOrder(rows, selected) : rows;
    if (onlySelected && source.length === 0) {
      setNotice({ kind: 'error', text: 'Önce aktarmak istediğiniz vagonları seçin.' });
      return;
    }
    const payload = buildCopyPayload(source, layout);
    if (payload.copiedCount === 0) {
      setNotice({ kind: 'error', text: 'Kopyalanabilecek geçerli vagon numarası bulunamadı.' });
      return;
    }
    const skippedNote = payload.skippedCount > 0 ? ` ${payload.skippedCount} geçersiz satır atlandı.` : '';
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([payload.text], { type: 'text/plain' }),
            'text/html': new Blob([payload.html], { type: 'text/html' }),
          }),
        ]);
        setNotice({
          kind: 'success',
          text: `${payload.copiedCount} vagon saha vaziyetine yapıştırılacak şekilde panoya kopyalandı.${skippedNote}`,
        });
      } else {
        await navigator.clipboard.writeText(payload.text);
        setNotice({
          kind: 'info',
          text: `${payload.copiedCount} vagon düz metin olarak kopyalandı. Tarayıcınız biçimli kopyalamayı desteklemediği için baştaki sıfırlar Excel'de korunmayabilir.${skippedNote}`,
        });
      }
    } catch {
      setNotice({ kind: 'error', text: 'Panoya kopyalanamadı. Tarayıcı izinlerini kontrol edin.' });
    }
  };

  const clearAll = () => {
    setRows([]);
    setSelected(new Set());
    setWarnings([]);
    setIgnoredGray(0);
    setNotice(null);
  };

  const selectedCount = useMemo(() => rows.filter((r) => selected.has(r.id)).length, [rows, selected]);

  return (
    <div className="space-y-6 min-w-0">
      <div
        role="button"
        tabIndex={0}
        aria-label="THBF PDF dosyası seç veya sürükleyip bırak"
        data-testid="thbf-dropzone"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-colors bg-[var(--color-glass-bg)] ${
          dragging ? 'border-violet-500 bg-violet-50/60' : 'border-border hover:border-violet-300'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
            <UploadCloud className="w-8 h-8" strokeWidth={1.6} />
          </div>
          <p className="font-semibold text-lg text-foreground">THBF PDF dosyasını buraya sürükleyin</p>
          <span className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
            PDF Seç
          </span>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Dosyanız cihazınızda işlenir, sunucuya yüklenmez.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Saha Vaziyeti Vagon No Düzeni
            <select
              data-testid="thbf-layout"
              value={layout}
              onChange={(e) => setLayout(e.target.value as SahaLayout)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {SAHA_LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground sm:pb-2.5">
            Düzen yalnızca kopyalanan çıktıyı etkiler. Gideceği her zaman son sütundur.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRows((r) => reverseRows(r))}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <ArrowUpDown className="w-4 h-4" /> Ters Çevir
          </button>
          <button
            type="button"
            onClick={() => void copy(false)}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <ClipboardCopy className="w-4 h-4" /> Tüm Vagonları Kopyala
          </button>
          <button
            type="button"
            onClick={() => void copy(true)}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <ListChecks className="w-4 h-4" /> Seçilen Vagonları Kopyala
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Temizle
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-muted-foreground font-medium animate-pulse">PDF çözümleniyor…</p>}

      {notice && (
        <div
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border p-3 text-sm font-medium ${
            notice.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : notice.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {notice.text}
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 list-disc pl-6">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="space-y-2 min-w-0">
          <p className="text-sm text-muted-foreground">
            {rows.length} vagon · {selectedCount} seçili
            {ignoredGray > 0 ? ` · ${ignoredGray} pasif (gri) vagon atlandı` : ''}
          </p>
          <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 text-center">SEÇ</th>
                  <th className="px-3 py-2.5">SIRA</th>
                  <th className="px-3 py-2.5">DİNGİL</th>
                  <th className="px-3 py-2.5">TİP</th>
                  <th className="px-3 py-2.5">REJİM</th>
                  <th className="px-3 py-2.5">SERİ</th>
                  <th className="px-3 py-2.5">VAGON NO</th>
                  <th className="px-3 py-2.5">GİDECEĞİ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const isSel = selected.has(row.id);
                  return (
                    <tr key={row.id} className={isSel ? 'bg-emerald-50 text-emerald-900' : ''}>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          aria-pressed={isSel}
                          aria-label={`Sıra ${row.sira} vagonunu ${isSel ? 'seçimden çıkar' : 'seç'}`}
                          onClick={() => toggle(row.id)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${
                            isSel ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border bg-background'
                          }`}
                        >
                          {isSel ? <CheckCircle2 className="w-4 h-4" /> : null}
                        </button>
                      </td>
                      <td className="px-3 py-1.5 font-medium">{row.sira}</td>
                      <td className="px-3 py-1.5">{row.dingil}</td>
                      <td className="px-3 py-1.5">{row.tip}</td>
                      <td className="px-3 py-1.5 font-mono">{row.regime}</td>
                      <td className="px-3 py-1.5 font-mono">{row.seri}</td>
                      <td className="px-3 py-1.5 font-mono">
                        {row.vagon_no.includes('-')
                          ? row.vagon_no
                          : row.vagon_no.slice(0, -1) + '-' + row.vagon_no.slice(-1)}
                      </td>
                      <td className="px-3 py-1.5">{row.gidecegi}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, AlertCircle, X, Check, Image as ImageIcon } from 'lucide-react';
import type { ExtractedWagonIdentity } from '@/lib/raybilgi/ocr-client';

interface PhotoInputProps {
  onIdentitiesExtracted: (wagons: ExtractedWagonIdentity[]) => void;
  disabled?: boolean;
}

/**
 * Browser-side client optimization:
 * If an image exceeds 1920px on its longest edge, creates an aspect-preserving
 * client-downscaled copy using canvas before upload to save bandwidth and upload time.
 * Falls back safely to original file if browser canvas fails or image is already <= 1920px.
 */
async function optimizeImageForUpload(file: File): Promise<File | Blob> {
  if (typeof window === 'undefined' || typeof window.createImageBitmap !== 'function') {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const maxEdge = Math.max(width, height);

    if (maxEdge <= 1920) {
      bitmap.close();
      return file;
    }

    const scale = 1920 / maxEdge;
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const outputType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), outputType, 0.88);
    });

    if (blob && blob.size < file.size) {
      return new File([blob], file.name, { type: outputType, lastModified: Date.now() });
    }
    return file;
  } catch {
    return file;
  }
}

export function PhotoInput({ onIdentitiesExtracted, disabled = false }: PhotoInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const selectFile = (file?: File) => {
    if (!file || disabled || loading) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setSuccessCount(null);
    setWarnings([]);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Lütfen geçerli bir JPEG, PNG veya WebP görseli seçin.');
      return;
    }

    if (!file.size) {
      setError('Görsel dosyası boş. Başka bir fotoğraf seçin.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Görsel boyutu 8 MB sınırını aşıyor.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccessCount(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccessCount(null);
    setWarnings([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || disabled || loading || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25_000);

    setLoading(true);
    setError(null);
    setSuccessCount(null);
    setWarnings([]);

    try {
      // Browser-side optimization: downscale large phone photos to max 1920px before upload
      const fileToUpload = await optimizeImageForUpload(selectedFile);

      const formData = new FormData();
      formData.append('image', fileToUpload, selectedFile.name);

      const res = await fetch('/raybilgi/vagon-dara/analyze-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (controller.signal.aborted) return;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Görsel taranırken bir hata oluştu.');
      }

      const wagons: ExtractedWagonIdentity[] = data.wagons || [];
      setWarnings(
        Array.isArray(data.warnings)
          ? data.warnings.filter((w: unknown) => typeof w === 'string')
          : []
      );
      if (wagons.length === 0) {
        setError(
          'Görselde okunabilir vagon numarası tespit edilemedi. Lütfen daha net bir fotoğraf deneyin veya elle ekleyin.'
        );
      } else {
        setSuccessCount(wagons.length);
        onIdentitiesExtracted(wagons);
      }
    } catch (err: unknown) {
      const msg = controller.signal.aborted
        ? 'Fotoğraf analizi zaman aşımına uğradı. Daha küçük veya net bir fotoğrafla tekrar deneyin.'
        : err instanceof Error
        ? err.message
        : 'Bir hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
      clearTimeout(timeout);
      requestRef.current = null;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Camera className="w-5 h-5 text-violet-600" />
            Fotoğraf veya Kamera ile Yükle
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vagon üzerindeki numaraları, Saha Vaziyeti belgesini veya liste fotoğrafını yükleyin.
          </p>
        </div>

        {/* Gizli file inputlar */}
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Vagon fotoğrafı seç"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          aria-label="Kameradan vagon fotoğrafı"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled || loading}
            className="flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-violet-600" />
            <span>Fotoğraf Çek</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
            className="flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Dosya Seç</span>
          </Button>
        </div>
      </div>

      {/* Önizleme veya Drag & Drop Alanı */}
      {!selectedFile ? (
        <div
          role="button"
          tabIndex={disabled || loading ? -1 : 0}
          aria-disabled={disabled || loading}
          onClick={() => {
            if (!disabled && !loading) fileInputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (['Enter', ' '].includes(e.key) && !disabled && !loading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            selectFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 transition-colors"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Görsel yüklemek için tıklayın veya sürükleyip bırakın
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG veya WebP (Maksimum 8 MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl border border-border bg-muted/30 p-3 flex flex-col sm:flex-row items-center gap-4">
            {previewUrl && (
              <div className="w-full sm:w-1/2 rounded-lg overflow-hidden border border-border shrink-0 bg-background flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Önizleme"
                  className="w-full max-h-96 object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-sm font-semibold text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
              </p>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block py-2 text-xs underline text-violet-700 dark:text-violet-300"
                >
                  Fotoğrafı büyük aç
                </a>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUploadAndAnalyze}
                  disabled={disabled || loading || successCount !== null}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Fotoğraf okunuyor...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-1.5" />
                      Numaraları Oku
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Başarı veya Hata Mesajı */}
      {error && (
        <div
          role="alert"
          className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {warnings.length > 0 && (
        <ul
          role="status"
          className="mt-3 space-y-1 text-xs text-amber-700 dark:text-amber-300"
        >
          {warnings.map((warning, i) => (
            <li key={i}>{warning}</li>
          ))}
        </ul>
      )}

      {successCount !== null && (
        <div
          role="status"
          className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>
            Fotoğraftan <strong>{successCount}</strong> vagon numarası başarıyla okundu ve listeye eklendi.
          </span>
        </div>
      )}
    </div>
  );
}

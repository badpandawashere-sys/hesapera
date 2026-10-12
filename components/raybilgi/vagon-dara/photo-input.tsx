'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, AlertCircle, X, Check, Image as ImageIcon } from 'lucide-react';
import { ExtractedWagonIdentity } from '@/lib/raybilgi/gemini-vision';

interface PhotoInputProps {
  onIdentitiesExtracted: (wagons: ExtractedWagonIdentity[]) => void;
  disabled?: boolean;
}

export function PhotoInput({ onIdentitiesExtracted, disabled = false }: PhotoInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Lütfen geçerli bir JPEG, PNG veya WebP görseli seçin.');
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

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccessCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setSuccessCount(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch('/raybilgi/vagon-dara/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Görsel taranırken bir hata oluştu.');
      }

      const wagons: ExtractedWagonIdentity[] = data.wagons || [];
      if (wagons.length === 0) {
        setError('Görselde okunabilir vagon numarası tespit edilemedi. Lütfen daha net bir fotoğraf deneyin veya elle ekleyin.');
      } else {
        setSuccessCount(wagons.length);
        onIdentitiesExtracted(wagons);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
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
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
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
          onClick={() => fileInputRef.current?.click()}
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
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-border shrink-0 bg-background flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Önizleme"
                  className="w-full h-full object-cover"
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
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUploadAndAnalyze}
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Numaralar Taranıyor...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-1.5" />
                      Numaraları Ayrıştır ve Ekle
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
        <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successCount !== null && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            Fotoğraftan <strong>{successCount}</strong> vagon numarası başarıyla tespit edildi ve listeye eklendi.
          </span>
        </div>
      )}
    </div>
  );
}

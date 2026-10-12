'use client';

import React, { useActionState } from 'react';
import { changePasswordAction, ChangePasswordState } from '@/lib/raybilgi/auth/account-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChangePasswordFormProps {
  stationName: string;
}

const initialState: ChangePasswordState = {};

export function ChangePasswordForm({ stationName }: ChangePasswordFormProps) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl bg-card border border-border shadow-sm">
      <div className="mb-6 text-center">
        <div className="inline-flex p-3 bg-violet-100 text-violet-700 rounded-xl mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          İstasyon Şifresi Belirle
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-semibold text-foreground">{stationName}</span> istasyonu için güvenli şifre oluşturun.
        </p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Hata</p>
            <p>{state.error}</p>
          </div>
        </div>
      )}

      {state?.success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold">Başarılı</p>
            <p>{state.message}</p>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider"
          >
            Yeni Şifre
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="En az 12 karakter..."
            minLength={12}
            maxLength={128}
            required
            disabled={isPending}
            className="h-10 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="confirmation"
            className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider"
          >
            Yeni Şifre (Tekrar)
          </label>
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="Şifrenizi tekrar girin..."
            minLength={12}
            maxLength={128}
            required
            disabled={isPending}
            className="h-10 text-sm"
          />
        </div>

        <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground space-y-1">
          <p className="font-medium flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Şifre Güvenlik Kuralı:
          </p>
          <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
            <li>Şifreniz en az 12 karakter olmalıdır.</li>
            <li>Türkçe karakterler dahil tüm karakterleri kullanabilirsiniz.</li>
            <li>Oluşturduğunuz şifre veritabanında tek yönlü scrypt hash ile korunur.</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-semibold h-10"
        >
          {isPending ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
        </Button>
      </form>
    </div>
  );
}

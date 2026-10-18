'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  FileText,
  Info,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { AdBanner } from '@/components/ads/ad-banner';
import {
  CalculatorBreakdownCard,
  CalculatorInfoCard,
} from '@/components/calculator/calculator-result';
import {
  PremiumCalculatorResultPanel,
  PremiumCalculatorShell,
  PremiumCalculatorSubmit,
} from '@/components/calculator/premium-calculator';
import { calculateAction } from '@/app/actions/calculate';
import type { CalculatorViewModel } from '@/calculators/core/calculator-types';
import type { MtvResult } from '@/calculators/formulas/mtv';

interface MtvFormProps {
  calculator: CalculatorViewModel;
}

function formatNumberTr(val: number): string {
  return new Intl.NumberFormat('tr-TR').format(val);
}

function formatCurrencyTr(val: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function parseIntegerInput(str: string): number | null {
  if (!str) return null;
  const clean = str.replace(/\./g, '').replace(/,/g, '').trim();
  const num = Number(clean);
  return isNaN(num) || clean === '' ? null : num;
}

function EmptyResultHero() {
  return (
    <PremiumCalculatorResultPanel state="empty">
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center flex-1 py-4">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner backdrop-blur-sm">
          <Receipt className="w-10 h-10 text-violet-300" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
          2026 MTV Tutarını Hesaplayın
        </h3>
        <p className="text-slate-300 text-sm max-w-[280px] leading-relaxed mb-6">
          Araç ve tescil bilgilerinizi girip <span className="text-violet-300 font-semibold">Hesapera Hesapla</span>&apos;ya tıklayın.
        </p>

        <div className="w-full max-w-xs space-y-2.5 text-left border-t border-white/10 pt-5">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2026 GİB 58 No&apos;lu Genel Tebliğ Tarifesi</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ocak ve Temmuz 2 Eşit Taksit Planı</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>TSB Kasko Değeri İndirimi Kontrolü</span>
          </div>
        </div>
      </div>
    </PremiumCalculatorResultPanel>
  );
}

function PopulatedResultHero({
  result,
  mounted,
}: {
  result: MtvResult;
  mounted: boolean;
}) {
  return (
    <PremiumCalculatorResultPanel state="populated">
      <div className="relative z-10 flex flex-col h-full space-y-6">
        {/* Üst Başlık ve Tarife Rozeti */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/30 rounded-xl border border-violet-400/30">
              <Car className="w-5 h-5 text-violet-200" />
            </div>
            <div>
              <span className="text-violet-300 font-bold tracking-wider uppercase text-xs block">
                2026 MTV HESAPLAMASI
              </span>
              <span className="text-[11px] text-slate-400">Binek Otomobil Tarifesi</span>
            </div>
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200">
            {result.tariff.includes('I/A') ? 'I/A (2017 Öncesi)' : 'I (2018 Sonrası)'}
          </span>
        </div>

        {/* Ana Sonuç: Yıllık MTV */}
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">
            {result.primaryLabel} (Yıllık Toplam)
          </h3>
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md flex items-baseline gap-2">
            {mounted ? (
              <NumberFlow
                value={result.annualTax}
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
              />
            ) : (
              <span>{formatCurrencyTr(result.annualTax)}</span>
            )}
            <span className="text-2xl sm:text-3xl font-extrabold text-violet-300">TL</span>
          </div>
        </div>

        {/* Özel Avantaj Rozetleri (Kasko & Elektrik) */}
        {result.adjustedByCasco && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300 block">Kasko İndirimi Uygulandı</span>
              <span>Yıllık vergi kasko bedelinin yasal sınırını aştığı için bir alt motor kademesi uygulandı.</span>
            </div>
          </div>
        )}

        {result.electricVehicle && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm font-medium">
            <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block">Elektrikli Araç Teşviki</span>
              <span>Tarife tutarının %25&apos;i uygulanmıştır (%75 yasal vergi muafiyeti).</span>
            </div>
          </div>
        )}

        {/* İki Eşit Taksit Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-violet-200 uppercase tracking-wide">
                1. Taksit (Ocak)
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {mounted ? (
                  <NumberFlow
                    value={result.installment}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  />
                ) : (
                  <span>{formatCurrencyTr(result.installment)}</span>
                )}{' '}
                <span className="text-sm font-bold text-violet-300">TL</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mt-2">Son Ödeme: 31 Ocak 2026</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-violet-200 uppercase tracking-wide">
                2. Taksit (Temmuz)
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {mounted ? (
                  <NumberFlow
                    value={result.installment}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  />
                ) : (
                  <span>{formatCurrencyTr(result.installment)}</span>
                )}{' '}
                <span className="text-sm font-bold text-violet-300">TL</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mt-2">Son Ödeme: 31 Temmuz 2026</p>
          </div>
        </div>

        {/* Tarife ve Kırılım Detayları */}
        <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Vergi Yaşı:</span>
            <span className="font-semibold text-white">
              {result.age} yaş ({result.ageBand})
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Uygulanan Tarife:</span>
            <span className="font-semibold text-white text-right">{result.tariff}</span>
          </div>
        </div>
      </div>
    </PremiumCalculatorResultPanel>
  );
}

export function MtvForm({ calculator }: MtvFormProps) {
  const [vehicleType, setVehicleType] = useState<'combustion' | 'electric'>('combustion');
  const [engineCcStr, setEngineCcStr] = useState<string>('1.600');
  const [motorPowerKwStr, setMotorPowerKwStr] = useState<string>('85');
  const [modelYear, setModelYear] = useState<string>('2023');
  const [firstRegistrationYear, setFirstRegistrationYear] = useState<string>('2023');
  const [vehicleValueStr, setVehicleValueStr] = useState<string>('500.000');
  const [cascoValueStr, setCascoValueStr] = useState<string>('');

  const [result, setResult] = useState<MtvResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const requestVersion = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearFieldError = (fieldId: string) => {
    if (errors[fieldId] || errors.general) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        delete next.general;
        return next;
      });
    }
  };

  const handleVehicleTypeChange = (newType: 'combustion' | 'electric') => {
    setVehicleType(newType);
    clearFieldError('vehicleType');
    clearFieldError('engineCc');
    clearFieldError('motorPowerKw');
  };

  const handleEngineCcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    clearFieldError('engineCc');
    if (raw === '') {
      setEngineCcStr('');
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      setEngineCcStr(formatNumberTr(num));
    }
  };

  const handleMotorPowerKwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9,.]/g, '');
    clearFieldError('motorPowerKw');
    setMotorPowerKwStr(raw);
  };

  const handleModelYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    clearFieldError('modelYear');
    clearFieldError('firstRegistrationYear');
    setModelYear(digitsOnly);
  };

  const handleFirstRegistrationYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    clearFieldError('firstRegistrationYear');
    setFirstRegistrationYear(digitsOnly);
  };

  const handleVehicleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    clearFieldError('vehicleValue');
    if (raw === '') {
      setVehicleValueStr('');
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      setVehicleValueStr(formatNumberTr(num));
    }
  };

  const handleCascoValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    clearFieldError('cascoValue');
    if (raw === '') {
      setCascoValueStr('');
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      setCascoValueStr(formatNumberTr(num));
    }
  };

  const handleReset = () => {
    requestVersion.current += 1;
    setVehicleType('combustion');
    setEngineCcStr('1.600');
    setMotorPowerKwStr('85');
    setModelYear('2023');
    setFirstRegistrationYear('2023');
    setVehicleValueStr('500.000');
    setCascoValueStr('');
    setResult(null);
    setErrors({});
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const version = ++requestVersion.current;
    setIsLoading(true);
    setErrors({});

    const payload: Record<string, any> = {
      vehicleType,
      modelYear: modelYear.trim() !== '' ? Number(modelYear.trim()) : undefined,
      firstRegistrationYear:
        firstRegistrationYear.trim() !== '' ? Number(firstRegistrationYear.trim()) : undefined,
    };

    if (vehicleType === 'combustion') {
      const cc = parseIntegerInput(engineCcStr);
      if (cc !== null) payload.engineCc = cc;
    } else {
      if (motorPowerKwStr.trim() !== '') {
        const kw = parseFloat(motorPowerKwStr.replace(',', '.'));
        if (!isNaN(kw)) payload.motorPowerKw = kw;
      }
    }

    const val = parseIntegerInput(vehicleValueStr);
    if (val !== null) payload.vehicleValue = val;

    const casco = parseIntegerInput(cascoValueStr);
    if (casco !== null) payload.cascoValue = casco;

    try {
      const response = await calculateAction(calculator.slug, payload);
      if (version !== requestVersion.current) return;

      if (response.success && response.data) {
        setResult(response.data as MtvResult);
        setErrors({});
      } else {
        const fieldErrors: Record<string, string> = {};
        const generalErrors: string[] = [];

        for (const err of response.errors ?? ['Hesaplama yapılamadı.']) {
          const separator = err.indexOf(':');
          if (separator > 0) {
            const fieldId = err.slice(0, separator).trim();
            const msg = err.slice(separator + 1).trim();
            fieldErrors[fieldId] = msg;
          } else {
            generalErrors.push(err);
          }
        }

        if (generalErrors.length > 0) {
          fieldErrors.general = generalErrors.join(' ');
        }
        setErrors(fieldErrors);
      }
    } catch {
      if (version === requestVersion.current) {
        setErrors({
          general: 'Hesaplama sırasında bir bağlantı hatası oluştu. Lütfen tekrar deneyin.',
        });
      }
    } finally {
      if (version === requestVersion.current) {
        setIsLoading(false);
      }
    }
  };

  const isPost2018 = Number(firstRegistrationYear) >= 2018 || firstRegistrationYear === '';

  return (
    <PremiumCalculatorShell
      isLoading={isLoading}
      form={
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
          {/* Bölüm 1: Araç Bilgileri */}
          <div className="bg-white/85 border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Araç Bilgileri</h3>
                <p className="text-xs text-slate-500">
                  Motor türü ve silindir hacmi veya motor gücü
                </p>
              </div>
            </div>

            {/* Motor Türü */}
            <div className="space-y-1.5">
              <Label htmlFor="vehicleType" className="text-sm font-semibold text-slate-700">
                Motor Türü <span className="text-destructive">*</span>
              </Label>
              <Select
                value={vehicleType}
                onValueChange={(val) => handleVehicleTypeChange(val as 'combustion' | 'electric')}
              >
                <SelectTrigger
                  id="vehicleType"
                  className="!h-12 !w-full !rounded-xl !text-base px-4 border border-input bg-background focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:border-violet-600 transition-colors flex items-center justify-between shadow-sm"
                  aria-invalid={!!errors.vehicleType}
                  aria-describedby={errors.vehicleType ? 'vehicleType-error' : 'vehicleType-helper'}
                >
                  <SelectValue placeholder="Motor türünü seçiniz">
                    {vehicleType === 'combustion'
                      ? 'Benzin, dizel veya hibrit'
                      : 'Sadece elektrik motoru'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combustion">Benzin, dizel veya hibrit</SelectItem>
                  <SelectItem value="electric">Sadece elektrik motoru</SelectItem>
                </SelectContent>
              </Select>
              <p id="vehicleType-helper" className="text-xs text-slate-500">
                İçten yanmalı motorlarda silindir hacmi; tam elektrikli otomobillerde kW cinsinden motor gücü esas alınır.
              </p>
              {errors.vehicleType && (
                <p
                  id="vehicleType-error"
                  role="alert"
                  className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.vehicleType}
                </p>
              )}
            </div>

            {/* Dinamik Alan: Motor Hacmi veya Elektrik Motor Gücü */}
            {vehicleType === 'combustion' ? (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="engineCc" className="text-sm font-semibold text-slate-700">
                  Motor Hacmi (cm³) <span className="text-destructive">*</span>
                </Label>
                <div
                  className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${
                    errors.engineCc
                      ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20 focus-within:border-destructive'
                      : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'
                  }`}
                >
                  <Input
                    id="engineCc"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9.]*"
                    value={engineCcStr}
                    onChange={handleEngineCcChange}
                    placeholder="Örn: 1.598 veya 2.000"
                    className="border-0 focus-visible:ring-0 shadow-none !h-12 !text-base rounded-none px-3.5 bg-transparent w-full font-medium"
                    aria-invalid={!!errors.engineCc}
                    aria-describedby={errors.engineCc ? 'engineCc-error' : 'engineCc-helper'}
                  />
                  <div className="flex items-center px-4 bg-muted/20 border-l border-input text-muted-foreground font-semibold text-sm select-none">
                    cm³
                  </div>
                </div>
                <p id="engineCc-helper" className="text-xs text-slate-500">
                  Ruhsatınızda (tescil belgesi) &quot;Silindir Hacmi&quot; hanesinde yazan değer (Örn: 1.598 veya 2.000).
                </p>
                {errors.engineCc && (
                  <p
                    id="engineCc-error"
                    role="alert"
                    className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errors.engineCc}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="motorPowerKw" className="text-sm font-semibold text-slate-700">
                  Elektrik Motor Gücü (kW) <span className="text-destructive">*</span>
                </Label>
                <div
                  className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${
                    errors.motorPowerKw
                      ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20 focus-within:border-destructive'
                      : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'
                  }`}
                >
                  <Input
                    id="motorPowerKw"
                    type="text"
                    inputMode="decimal"
                    value={motorPowerKwStr}
                    onChange={handleMotorPowerKwChange}
                    placeholder="Örn: 150"
                    className="border-0 focus-visible:ring-0 shadow-none !h-12 !text-base rounded-none px-3.5 bg-transparent w-full font-medium"
                    aria-invalid={!!errors.motorPowerKw}
                    aria-describedby={
                      errors.motorPowerKw ? 'motorPowerKw-error' : 'motorPowerKw-helper'
                    }
                  />
                  <div className="flex items-center px-4 bg-muted/20 border-l border-input text-muted-foreground font-semibold text-sm select-none">
                    kW
                  </div>
                </div>
                <p id="motorPowerKw-helper" className="text-xs text-slate-500">
                  Ruhsatta &quot;Net Motor Gücü&quot; hanesinde kW olarak belirtilen değer (Örn: 150).
                </p>
                {errors.motorPowerKw && (
                  <p
                    id="motorPowerKw-error"
                    role="alert"
                    className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errors.motorPowerKw}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bölüm 2: Tescil ve Değer Bilgileri */}
          <div className="bg-white/85 border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Tescil ve Değer Bilgileri</h3>
                <p className="text-xs text-slate-500">
                  Vergi yaşını ve yasal tarife kademesini belirler
                </p>
              </div>
            </div>

            {/* Model Yılı & İlk Tescil Yılı (Grid 2 Kolon, Mobilde Tek Kolon) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Model Yılı */}
              <div className="space-y-1.5">
                <Label htmlFor="modelYear" className="text-sm font-semibold text-slate-700">
                  Model Yılı <span className="text-destructive">*</span>
                </Label>
                <div
                  className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${
                    errors.modelYear
                      ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20 focus-within:border-destructive'
                      : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'
                  }`}
                >
                  <Input
                    id="modelYear"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={modelYear}
                    onChange={handleModelYearChange}
                    placeholder="Örn: 2023"
                    className="border-0 focus-visible:ring-0 shadow-none !h-12 !text-base rounded-none px-3.5 bg-transparent w-full font-medium"
                    aria-invalid={!!errors.modelYear}
                    aria-describedby={errors.modelYear ? 'modelYear-error' : 'modelYear-helper'}
                  />
                  <div className="flex items-center px-3 bg-muted/10 border-l border-input text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p id="modelYear-helper" className="text-xs text-slate-500">
                  Aracın model yılı. 2026 yılı hesabında vergi yaşını belirler.
                </p>
                {errors.modelYear && (
                  <p
                    id="modelYear-error"
                    role="alert"
                    className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errors.modelYear}
                  </p>
                )}
              </div>

              {/* İlk Tescil Yılı */}
              <div className="space-y-1.5">
                <Label htmlFor="firstRegistrationYear" className="text-sm font-semibold text-slate-700">
                  İlk Tescil Yılı <span className="text-destructive">*</span>
                </Label>
                <div
                  className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${
                    errors.firstRegistrationYear
                      ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20 focus-within:border-destructive'
                      : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'
                  }`}
                >
                  <Input
                    id="firstRegistrationYear"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={firstRegistrationYear}
                    onChange={handleFirstRegistrationYearChange}
                    placeholder="Örn: 2023"
                    className="border-0 focus-visible:ring-0 shadow-none !h-12 !text-base rounded-none px-3.5 bg-transparent w-full font-medium"
                    aria-invalid={!!errors.firstRegistrationYear}
                    aria-describedby={
                      errors.firstRegistrationYear
                        ? 'firstRegistrationYear-error'
                        : 'firstRegistrationYear-helper'
                    }
                  />
                  <div className="flex items-center px-3 bg-muted/10 border-l border-input text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p id="firstRegistrationYear-helper" className="text-xs text-slate-500">
                  2018 öncesi tesciller I/A, 2018 ve sonrası I tarifesine girer.
                </p>
                {errors.firstRegistrationYear && (
                  <p
                    id="firstRegistrationYear-error"
                    role="alert"
                    className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errors.firstRegistrationYear}
                  </p>
                )}
              </div>
            </div>

            {/* Vergiye Esas Taşıt Değeri */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="vehicleValue" className="text-sm font-semibold text-slate-700">
                  Vergiye Esas Taşıt Değeri (TL)
                  {isPost2018 ? (
                    <>
                      <span className="text-destructive ml-1">*</span>
                      <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded-full ml-1.5">
                        2018+ Zorunlu
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      (2018 öncesi için opsiyonel)
                    </span>
                  )}
                </Label>
              </div>

              <div
                className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${
                  errors.vehicleValue
                    ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20 focus-within:border-destructive'
                    : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'
                }`}
              >
                <div className="flex items-center pl-4 pr-1 text-muted-foreground font-semibold text-base select-none">
                  ₺
                </div>
                <Input
                  id="vehicleValue"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  value={vehicleValueStr}
                  onChange={handleVehicleValueChange}
                  placeholder={
                    isPost2018 ? 'Örn: 500.000' : '2018 öncesi araçlarda boş bırakılabilir'
                  }
                  className="border-0 focus-visible:ring-0 shadow-none !h-12 !text-base rounded-none px-2 bg-transparent w-full font-medium"
                  aria-invalid={!!errors.vehicleValue}
                  aria-describedby={errors.vehicleValue ? 'vehicleValue-error' : 'vehicleValue-helper'}
                />
              </div>
              <p id="vehicleValue-helper" className="text-xs text-slate-500 leading-relaxed">
                2018 ve sonrası ilk tescilli araçlarda tarife kademesini belirler. İkinci el ilan fiyatı yerine tescil faturasındaki KDV matrahına esas taşıt değerini kullanın.
              </p>
              {errors.vehicleValue && (
                <p
                  id="vehicleValue-error"
                  role="alert"
                  className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.vehicleValue}
                </p>
              )}
            </div>

            {/* Kasko Değeri (İsteğe Bağlı) */}
            <div className="space-y-1.5">
              <Label htmlFor="cascoValue" className="text-sm font-semibold text-slate-700">
                Kasko Değeri (TL){' '}
                <span className="text-xs font-normal text-slate-400 ml-1.5">(İsteğe bağlı)</span>
              </Label>
              <div
                className={`relative flex items-stretch rounded-xl border bg-background overflow-hidden transition-colors shadow-sm ${
                  errors.cascoValue
                    ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20 focus-within:border-destructive'
                    : 'border-input focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-600'
                }`}
              >
                <div className="flex items-center pl-4 pr-1 text-muted-foreground font-semibold text-base select-none">
                  ₺
                </div>
                <Input
                  id="cascoValue"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  value={cascoValueStr}
                  onChange={handleCascoValueChange}
                  placeholder="Kasko indirimi kontrolü için değer girin"
                  className="border-0 focus-visible:ring-0 shadow-none !h-12 !text-base rounded-none px-2 bg-transparent w-full font-medium"
                  aria-invalid={!!errors.cascoValue}
                  aria-describedby={errors.cascoValue ? 'cascoValue-error' : 'cascoValue-helper'}
                />
              </div>
              <p id="cascoValue-helper" className="text-xs text-slate-500 leading-relaxed">
                TSB Kasko Değer Listesi tutarını girin. Hesaplanan vergi kasko bedelinin %5 veya %10&apos;unu aşarsa bir alt kademe uygulanır.
              </p>
              {errors.cascoValue && (
                <p
                  id="cascoValue-error"
                  role="alert"
                  className="text-xs sm:text-sm font-medium text-destructive mt-1.5 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.cascoValue}
                </p>
              )}
            </div>
          </div>

          {/* Genel Hata Uyarısı */}
          {errors.general && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 font-medium flex items-start gap-3"
            >
              <div className="shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div>{errors.general}</div>
            </div>
          )}

          {/* Gönder ve Sıfırla Butonları */}
          <PremiumCalculatorSubmit
            type="submit"
            isLoading={isLoading}
            containerClassName="pt-2"
            footer={
              <Button
                type="button"
                variant="outline"
                className="h-[52px] rounded-full px-8 text-base font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Formu Temizle</span>
              </Button>
            }
          />
        </form>
      }
      result={
        result ? (
          <PopulatedResultHero result={result} mounted={mounted} />
        ) : (
          <EmptyResultHero />
        )
      }
    >
      <AdBanner placement="calculator-after-result" />

      {result && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none">
          {result.breakdown && (
            <CalculatorBreakdownCard
              result={{
                success: true,
                data: {
                  breakdown: result.breakdown,
                  primaryResult: result.primaryResult,
                  secondaryResults: result.secondaryResults,
                },
              }}
            />
          )}
          {result.infoReference && (
            <CalculatorInfoCard
              result={{
                success: true,
                data: {
                  infoReference: result.infoReference,
                  primaryResult: result.primaryResult,
                  secondaryResults: result.secondaryResults,
                },
              }}
            />
          )}
        </div>
      )}
    </PremiumCalculatorShell>
  );
}

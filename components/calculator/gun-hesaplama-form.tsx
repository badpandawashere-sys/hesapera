"use client";
import { useState, useEffect } from "react";
import { CalculatorViewModel } from "@/calculators/core/calculator-types";
import { calculateAction } from "@/app/actions/calculate";
import { CalculatorSubmitButton } from "./calculator-submit-button";
import { CalculatorBreakdownCard } from "./calculator-result";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, Calculator, CheckCircle2 } from "lucide-react";
import { ShareResult } from "./share-result";
import { AdBanner } from "@/components/ads/ad-banner";

interface GunHesaplamaFormProps {
  calculator: CalculatorViewModel;
}

export function GunHesaplamaForm({ calculator }: GunHesaplamaFormProps) {
  const [mode, setMode] = useState<"kaldi" | "gecti" | "arasi">("kaldi");
  const [targetDate, setTargetDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceDate, setReferenceDate] = useState("");
  
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    setReferenceDate(localDate);
  }, []);

  const handleModeChange = (newMode: "kaldi" | "gecti" | "arasi") => {
    setMode(newMode);
    setResult(null);
    setFieldErrors({});
  };

  const handleSwap = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});
    setResult(null);

    try {
      const data = { mode, targetDate, startDate, endDate, referenceDate };
      const res = await calculateAction(calculator.slug, data);
      
      if (res.success && res.data) {
        setResult(res);
      } else if (res.errors) {
        setFieldErrors({ _form: res.errors.join(", ") });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            {[{ id: "kaldi", label: "Kaç Gün Kaldı" }, { id: "gecti", label: "Kaç Gün Geçti" }, { id: "arasi", label: "İki Tarih Arası" }].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id as any)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  mode === m.id ? "bg-white text-violet-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {mode === "kaldi" && (
              <div className="space-y-2">
                <Label htmlFor="targetDate" className="text-sm font-semibold text-slate-700">Hedef Tarih</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={`h-12 ${fieldErrors["targetDate"] ? "border-destructive" : ""}`}
                />
              </div>
            )}

            {mode === "gecti" && (
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`h-12 ${fieldErrors["startDate"] ? "border-destructive" : ""}`}
                />
              </div>
            )}

            {mode === "arasi" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">Başlangıç Tarihi</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`h-12 ${fieldErrors["startDate"] ? "border-destructive" : ""}`}
                  />
                </div>
                
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200 p-2 rounded-full shadow-sm transition-colors"
                    title="Tarihleri Değiştir"
                  >
                    <ArrowUpDown size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700">Bitiş Tarihi</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`h-12 ${fieldErrors["endDate"] ? "border-destructive" : ""}`}
                  />
                </div>
              </div>
            )}
            
            {fieldErrors["_form"] && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {fieldErrors["_form"]}
              </div>
            )}

            <div className="pt-2">
              <CalculatorSubmitButton isLoading={isLoading} onClick={handleSubmit as any} />
            </div>
          </div>
        </form>
      </div>

      <div className="lg:col-span-5 space-y-6">
        {result && result.success ? (
          <div id="calculator-result" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="rounded-[24px] bg-[var(--color-glass-bg-strong)] backdrop-blur-[24px] border border-[var(--color-glass-border)] shadow-[var(--shadow-glass-elevated)] overflow-hidden flex flex-col">
              <div className="border-b border-border bg-white/40 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#7C3AED]" />
                  <h3 className="font-semibold text-slate-800">Hesaplama Sonucu</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hesaplama tamamlandı</span>
                  <span className="sm:hidden">Tamamlandı</span>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div className="bg-gradient-to-br from-[#F5F3FF]/80 to-[#EFF6FF]/80 border border-white/60 rounded-[20px] p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="text-5xl md:text-6xl font-extrabold text-violet-700 tracking-tight relative z-10">
                    {result.data.primaryResult}
                  </div>
                  <p className="text-lg font-bold text-slate-700 mt-2 relative z-10">{result.data.secondaryResults?.subLabel}</p>
                </div>
              </div>
            </div>

            {result.data.breakdown && result.data.breakdown.length > 0 && (
              <CalculatorBreakdownCard result={result} />
            )}
            <ShareResult calculatorName={calculator.name} slug={calculator.slug} data={result.data} />
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed p-8 h-full min-h-[300px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/60 border border-white flex items-center justify-center mb-5 text-slate-400 shadow-sm">
              <Calculator size={32} />
            </div>
            <p className="text-[17px] font-semibold text-slate-800">Henüz hesaplama yapılmadı</p>
            <p className="text-[15px] text-slate-500 mt-2 max-w-xs leading-relaxed">
              Sonucu görmek için formu doldurun ve Hesapla butonuna tıklayın.
            </p>
          </div>
        )}
        <AdBanner placement="calculator-after-result" />
      </div>
    </div>
  );
}

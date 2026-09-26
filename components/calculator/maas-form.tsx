"use client";
import { useState, useEffect } from "react";
import { CalculatorViewModel } from "@/calculators/core/calculator-types";
import { calculateAction } from "@/app/actions/calculate";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import NumberFlow from "@number-flow/react";

const formatDec = (num: number) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function MaasForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [grossStr, setGrossStr] = useState<string>("50.000");
  const [gross, setGross] = useState<number>(50000);
  const [employerDiscountType, setEmployerDiscountType] = useState<"none"|"other"|"manufacturing">("none");
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const parseFormattedStr = (str: string): number | null => {
    if (!str) return null;
    const normalized = str.replace(/\./g, "").replace(/,/g, ".");
    const n = Number(normalized);
    return isNaN(n) ? null : n;
  };

  const makeNumberHandler = (setStr: (s: string) => void, setVal: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.includes("-")) return;
    val = val.replace(/[^0-9,]/g, "");
    setStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && parsed >= 0) {
      setVal(parsed);
    }
  };

  const handleBlur = (val: number, setStr: (s: string) => void) => () => {
    setStr(new Intl.NumberFormat("tr-TR").format(val));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let isActive = true;
    const calculate = async () => {
      setLoading(true);
      try {
        const response = await calculateAction(calculator.slug, { grossSalary: gross, employerDiscountType });
        if (isActive) setRes(response);
      } catch (e) {
        if (isActive) setRes({ success: false, errors: [(e as any).message] });
      } finally {
        if (isActive) setLoading(false);
      }
    };
    
    // Immediate execution for first render, debounce for subsequent input changes
    const t = setTimeout(calculate, 300);
    return () => {
      isActive = false;
      clearTimeout(t);
    };
  }, [mounted, gross, employerDiscountType, calculator.slug]);

  const isErr = res && res.success === false;
  const errText = res?.errors?.[0];
  const validationErr = gross > 0 && gross < 33030 ? "2026 tam ay brüt asgari ücretin (33.030 TL) altında olamaz." : null;

  const primary = res?.success ? res.data.primaryResult : null;
  const months = primary?.months || [];
  const janNet = months[0]?.netSalary || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <div className="w-full lg:w-[45%] flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Maaş Hesaplama</h2>
              <p className="text-sm text-slate-500 mt-1">2026 Ücretli Çalışan Bordrosu</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Aylık Brüt Maaş (TL)</label>
              <div className="relative">
                <input type="text" inputMode="decimal" value={grossStr} onChange={makeNumberHandler(setGrossStr, setGross)} onBlur={handleBlur(gross, setGrossStr)} className={`w-full px-4 py-3 rounded-xl border font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all pl-12 ${validationErr ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 bg-slate-50 hover:bg-white"}`} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              </div>
              {validationErr && <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{validationErr}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">İşveren SGK İndirimi</label>
              <select value={employerDiscountType} onChange={(e) => setEmployerDiscountType(e.target.value as any)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 font-medium appearance-none">
                <option value="none">İndirim uygulanmıyor</option>
                <option value="other">Diğer sektörler — 2 Puan İndirimi</option>
                <option value="manufacturing">İmalat sektörü</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-indigo-100 font-medium">Ocak Ayı Net Maaş</h3>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-white/50" />}
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <div className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm flex items-baseline gap-1">
                <NumberFlow value={janNet} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                <span className="text-2xl font-bold text-indigo-200">TL</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
              <div><p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Yıllık Brüt</p><p className="font-bold text-lg">{primary ? formatDec(primary.annualGross) : "0,00"} <span className="text-sm text-indigo-300">TL</span></p></div>
              <div><p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Yıllık Net</p><p className="font-bold text-lg">{primary ? formatDec(primary.annualNet) : "0,00"} <span className="text-sm text-indigo-300">TL</span></p></div>
              <div><p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Yıllık Kesintiler</p><p className="font-bold text-lg">{primary ? formatDec(primary.annualTaxesAndPremiums) : "0,00"} <span className="text-sm text-indigo-300">TL</span></p></div>
              <div><p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Yıllık İşv. Maliyeti</p><p className="font-bold text-lg">{primary ? formatDec(primary.annualEmployerCost) : "0,00"} <span className="text-sm text-indigo-300">TL</span></p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Aylık Bordro Tablosu (2026)</h3>
          {isErr ? (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-medium border border-rose-100">
              {errText || "Hesaplama yapılırken bir hata oluştu."}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Ay</th>
                    <th className="pb-3 font-semibold text-right">Brüt</th>
                    <th className="pb-3 font-semibold text-right">SGK</th>
                    <th className="pb-3 font-semibold text-right">İşsizlik</th>
                    <th className="pb-3 font-semibold text-right">Gelir V.</th>
                    <th className="pb-3 font-semibold text-right">Damga V.</th>
                    <th className="pb-3 font-semibold text-right">Kümülatif</th>
                    <th className="pb-3 font-bold text-slate-800 text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {months.map((m: any) => (
                    <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-700">{m.monthName}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.grossSalary)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.sgkEmployee)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.unemploymentEmployee)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.incomeTax)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.stampTax)}</td>
                      <td className="py-3 text-right text-slate-400 text-xs">{formatDec(m.cumulativeTaxBase)}</td>
                      <td className="py-3 text-right font-bold text-indigo-600">{formatDec(m.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

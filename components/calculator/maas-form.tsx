"use client";

import { useState, useEffect, useRef } from "react";
import { CalculatorViewModel } from "@/calculators/core/calculator-types";
import { calculateAction } from "@/app/actions/calculate";
import { Loader2, Wallet, AlertCircle, Info } from "lucide-react";
import NumberFlow from "@number-flow/react";

const formatDec = (num: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function MaasForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [calculationMode, setCalculationMode] = useState<"grossToNet" | "netToGross">("grossToNet");
  const [grossStr, setGrossStr] = useState<string>("50.000");
  const [gross, setGross] = useState<number>(50000);
  const [netStr, setNetStr] = useState<string>("45.000");
  const [net, setNet] = useState<number>(45000);
  const [employerDiscountType, setEmployerDiscountType] = useState<"none" | "other" | "manufacturing">("none");
  const [res, setRes] = useState<any>(null);
  const [resolvedPayloadKey, setResolvedPayloadKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Request counter to discard out-of-order responses from delayed network calls
  const reqIdRef = useRef<number>(0);

  const parseFormattedStr = (str: string): number | null => {
    if (!str || str.trim() === "") return null;
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
    if (parsed !== null && !isNaN(parsed) && parsed >= 0) {
      setVal(parsed);
    } else {
      setVal(0);
    }
  };

  const handleBlur = (str: string, val: number, setStr: (s: string) => void) => () => {
    if (!str || str.trim() === "" || val <= 0 || isNaN(val)) {
      return;
    }
    setStr(new Intl.NumberFormat("tr-TR").format(val));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGrossMode = calculationMode === "grossToNet";
  const currentAmount = isGrossMode ? gross : net;
  const currentAmountStr = isGrossMode ? grossStr : netStr;

  let validationErr: string | null = null;
  if (isGrossMode) {
    if (!grossStr || grossStr.trim() === "") {
      validationErr = "Lütfen bir brüt maaş tutarı girin.";
    } else if (gross <= 0) {
      validationErr = "Lütfen geçerli bir brüt maaş tutarı girin.";
    } else if (gross < 33030) {
      validationErr = "2026 yılı için brüt maaş asgari ücret olan 33.030 TL'den düşük olamaz.";
    }
  } else {
    if (!netStr || netStr.trim() === "") {
      validationErr = "Lütfen bir hedef net maaş tutarı girin.";
    } else if (net <= 0) {
      validationErr = "Lütfen geçerli bir hedef net maaş tutarı girin.";
    } else if (net < 28075.50) {
      validationErr = "2026 yılı için net maaş asgari ücret neti olan 28.075,50 TL'den düşük olamaz.";
    }
  }

  const activePayloadKey = isGrossMode
    ? `grossToNet:${gross}:${employerDiscountType}`
    : `netToGross:${net}:${employerDiscountType}`;

  useEffect(() => {
    if (!mounted) return;

    if (validationErr) {
      setLoading(false);
      setRes(null);
      setResolvedPayloadKey("");
      return;
    }

    const currentReqId = ++reqIdRef.current;
    const requestKey = activePayloadKey;
    setLoading(true);

    const calculate = async () => {
      try {
        const payload: Record<string, any> = {
          calculationMode,
          employerDiscountType
        };
        if (calculationMode === "grossToNet") {
          payload.grossSalary = gross;
        } else {
          payload.netSalary = net;
        }

        const response = await calculateAction(calculator.slug, payload);
        // Only accept response if this is still the newest active request
        if (currentReqId === reqIdRef.current) {
          setRes(response);
          setResolvedPayloadKey(requestKey);
        }
      } catch (e) {
        if (currentReqId === reqIdRef.current) {
          setRes({ success: false, errors: [(e as any).message] });
          setResolvedPayloadKey(requestKey);
        }
      } finally {
        if (currentReqId === reqIdRef.current) {
          setLoading(false);
        }
      }
    };

    const t = setTimeout(calculate, 300);
    return () => {
      clearTimeout(t);
    };
  }, [mounted, calculationMode, gross, net, employerDiscountType, calculator.slug, validationErr, activePayloadKey]);

  const isErr = res && res.success === false;
  const errText = res?.errors?.[0];

  // Match validation: Ensure result matches currently active request payload exactly
  const isPayloadMatched = resolvedPayloadKey === activePayloadKey;
  const isStale = loading || !isPayloadMatched || validationErr !== null;

  const primary = (res?.success && isPayloadMatched && !validationErr) ? res.data.primaryResult : null;
  const months = primary?.months || [];
  const janMonth = months[0] || null;
  const decMonth = months[11] || null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Left Input & Primary Summary Section */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Maaş Hesaplama</h2>
              <p className="text-sm text-slate-500 mt-1">2026 Ücretli Çalışan Bordrosu</p>
            </div>
          </div>

          {/* Accessible Mode Switcher Segmented Control */}
          <div
            role="tablist"
            aria-label="Maaş hesaplama yönü"
            className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl mb-6"
          >
            <button
              id="tab-grossToNet"
              role="tab"
              type="button"
              aria-selected={calculationMode === "grossToNet"}
              aria-controls="panel-grossToNet"
              onClick={() => setCalculationMode("grossToNet")}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                calculationMode === "grossToNet"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Brütten Nete</span>
            </button>
            <button
              id="tab-netToGross"
              role="tab"
              type="button"
              aria-selected={calculationMode === "netToGross"}
              aria-controls="panel-netToGross"
              onClick={() => setCalculationMode("netToGross")}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                calculationMode === "netToGross"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Netten Brüte</span>
            </button>
          </div>

          <div className="space-y-6">
            {calculationMode === "grossToNet" ? (
              <div id="panel-grossToNet" role="tabpanel" aria-labelledby="tab-grossToNet">
                <label htmlFor="maas-gross-input" className="block text-sm font-semibold text-slate-700 mb-2">
                  Aylık Brüt Maaş (TL)
                </label>
                <div className="relative">
                  <input
                    id="maas-gross-input"
                    type="text"
                    inputMode="decimal"
                    value={grossStr}
                    onChange={makeNumberHandler(setGrossStr, setGross)}
                    onBlur={handleBlur(grossStr, gross, setGrossStr)}
                    className={`w-full px-4 py-3 rounded-xl border font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all pl-12 ${
                      validationErr
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 bg-slate-50 hover:bg-white"
                    }`}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                </div>
                {validationErr && (
                  <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {validationErr}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Sabit brüt maaş üzerinden 12 aylık artan oranlı vergi kesintileri hesaplanır.
                </p>
              </div>
            ) : (
              <div id="panel-netToGross" role="tabpanel" aria-labelledby="tab-netToGross">
                <label htmlFor="maas-net-input" className="block text-sm font-semibold text-slate-700 mb-2">
                  Aylık Hedef Net Maaş (TL)
                </label>
                <div className="relative">
                  <input
                    id="maas-net-input"
                    type="text"
                    inputMode="decimal"
                    value={netStr}
                    onChange={makeNumberHandler(setNetStr, setNet)}
                    onBlur={handleBlur(netStr, net, setNetStr)}
                    className={`w-full px-4 py-3 rounded-xl border font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all pl-12 ${
                      validationErr
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 bg-slate-50 hover:bg-white"
                    }`}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                </div>
                {validationErr && (
                  <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {validationErr}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Çalışanın her ay eline geçecek net tutar için gereken aylık brüt ücretler çözülür.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="maas-employer-discount" className="block text-sm font-semibold text-slate-700 mb-2">
                İşveren SGK İndirimi
              </label>
              <select
                id="maas-employer-discount"
                value={employerDiscountType}
                onChange={(e) => setEmployerDiscountType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 font-medium appearance-none"
              >
                <option value="none">İndirim uygulanmıyor (%21,75 SGK)</option>
                <option value="other">Diğer sektörler — 2 Puan İndirimi (%19,75 SGK)</option>
                <option value="manufacturing">İmalat sektörü — 5 Puan İndirimi (%16,75 SGK)</option>
              </select>
            </div>

            {/* Sabit Net Anlaşması Bilgi Kutusu */}
            {calculationMode === "netToGross" && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Sabit Net Maaş Modeli Nasıl Çalışır?</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Net maaş sözleşmesinde çalışan her ay <strong>{formatDec(net)} TL</strong> net alır. Gelir vergisi dilimleri (%15 → %20 → %27) arttıkça net maaşın düşmemesi için <strong>gereken brüt maaş ve işveren maliyeti yıl sonuna doğru kademeli olarak yükselir.</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Highlight Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-indigo-100 font-medium">
                {calculationMode === "grossToNet" ? "Ocak Ayı Net Maaş" : "Gereken Brüt Maaş (Ocak)"}
              </h3>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-white/50" />}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              {isStale ? (
                <div className="h-12 w-48 bg-white/20 animate-pulse rounded-lg my-1" />
              ) : (
                <div className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm flex items-baseline gap-1">
                  <NumberFlow
                    value={calculationMode === "grossToNet" ? (janMonth?.netSalary || 0) : (janMonth?.grossSalary || 0)}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  />
                  <span className="text-2xl font-bold text-indigo-200">TL</span>
                </div>
              )}
            </div>

            {calculationMode === "netToGross" && decMonth && !isStale && (
              <p className="text-xs text-indigo-200/90 mb-4">
                Yıl Sonu (Aralık) Brütü: <strong>{formatDec(decMonth.grossSalary)} TL</strong> • Ortalama: <strong>{formatDec(primary?.averageMonthlyGross || 0)} TL</strong>
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">
                  {calculationMode === "grossToNet" ? "Yıllık Brüt" : "Yıllık Toplam Brüt"}
                </p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (primary ? formatDec(primary.annualGross) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">
                  {calculationMode === "grossToNet" ? "Yıllık Net" : "Yıllık Net (Hedef)"}
                </p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (primary ? formatDec(primary.annualNet) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Yıllık Kesintiler</p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (primary ? formatDec(primary.annualTaxesAndPremiums) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Yıllık İşv. Maliyeti</p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (primary ? formatDec(primary.annualEmployerCost) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 12 Months Table Section */}
      <div className="w-full lg:w-[55%] flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800">Aylık Bordro Tablosu (2026)</h3>
            <span className="text-xs text-slate-400 font-medium">
              {calculationMode === "grossToNet" ? "Sabit Brüt Maaş Modeli" : "Sabit Net Maaş Modeli"}
            </span>
          </div>

          {validationErr ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">{validationErr}</p>
              <p className="text-xs text-slate-400">Sonuçları ve 12 aylık bordro tablosunu görmek için geçerli bir tutar girin.</p>
            </div>
          ) : isErr ? (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-medium border border-rose-100">
              {errText || "Hesaplama yapılırken bir hata oluştu."}
            </div>
          ) : isStale ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Bordro hesaplanıyor...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 text-xs">
                    <th className="pb-3 font-semibold">Ay</th>
                    <th className={`pb-3 font-semibold text-right ${calculationMode === "netToGross" ? "text-indigo-600 font-bold" : ""}`}>
                      Brüt
                    </th>
                    <th className="pb-3 font-semibold text-right">SGK</th>
                    <th className="pb-3 font-semibold text-right">İşsizlik</th>
                    <th className="pb-3 font-semibold text-right">Gelir V.</th>
                    <th className="pb-3 font-semibold text-right">Damga V.</th>
                    <th className="pb-3 font-semibold text-right text-slate-400 font-normal">Kümülatif</th>
                    <th className={`pb-3 font-semibold text-right ${calculationMode === "grossToNet" ? "text-indigo-600 font-bold" : ""}`}>
                      Net
                    </th>
                    <th className="pb-3 font-semibold text-right text-slate-600">İşv. Mal.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {months.map((m: any) => (
                    <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-700">{m.monthName}</td>
                      <td className={`py-3 text-right ${calculationMode === "netToGross" ? "font-bold text-indigo-600" : "text-slate-600"}`}>
                        {formatDec(m.grossSalary)}
                      </td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.sgkEmployee)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.unemploymentEmployee)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.incomeTax)}</td>
                      <td className="py-3 text-right text-slate-600">{formatDec(m.stampTax)}</td>
                      <td className="py-3 text-right text-slate-400 text-xs">{formatDec(m.cumulativeTaxBase)}</td>
                      <td className={`py-3 text-right ${calculationMode === "grossToNet" ? "font-bold text-indigo-600" : "font-medium text-slate-700"}`}>
                        {formatDec(m.netSalary)}
                      </td>
                      <td className="py-3 text-right text-slate-500 text-xs">{formatDec(m.monthlyEmployerCost)}</td>
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

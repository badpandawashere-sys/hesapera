"use client";

import { useState, useEffect, useRef } from "react";
import { CalculatorViewModel } from "@/calculators/core/calculator-types";
import { calculateAction } from "@/app/actions/calculate";
import {
  isValidCalendarDate,
  getKidemTavani,
  CSGB_SOURCE_URL
} from "@/calculators/formulas/kidemTazminati";
import { Loader2, Briefcase, AlertCircle, Info, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import NumberFlow from "@number-flow/react";

const formatDec = (num: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

export function KidemTazminatiForm({ calculator }: { calculator: CalculatorViewModel }) {
  const [startDate, setStartDate] = useState<string>("2022-01-01");
  const [endDate, setEndDate] = useState<string>("2026-02-01");
  const [startBadInput, setStartBadInput] = useState<boolean>(false);
  const [endBadInput, setEndBadInput] = useState<boolean>(false);
  const [grossStr, setGrossStr] = useState<string>("50.000");
  const [gross, setGross] = useState<number>(50000);
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

  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.includes("-")) return;
    val = val.replace(/[^0-9,]/g, "");
    setGrossStr(val);
    const parsed = parseFormattedStr(val);
    if (parsed !== null && !isNaN(parsed) && parsed > 0) {
      setGross(parsed);
    } else {
      setGross(0);
    }
  };

  const handleGrossBlur = () => {
    if (!grossStr || grossStr.trim() === "" || gross <= 0 || isNaN(gross)) {
      return;
    }
    setGrossStr(new Intl.NumberFormat("tr-TR").format(gross));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation logic
  let validationErr: string | null = null;
  if (startBadInput || (startDate && !isValidCalendarDate(startDate))) {
    validationErr = "İşe başlama tarihi için geçerli bir takvim günü girin (örn. 2026-02-30 geçersizdir).";
  } else if (!startDate) {
    validationErr = "Lütfen işe başlama tarihini seçin.";
  } else if (endBadInput || (endDate && !isValidCalendarDate(endDate))) {
    validationErr = "İşten ayrılış tarihi için geçerli bir takvim günü girin (örn. 2026-02-30 geçersizdir).";
  } else if (!endDate) {
    validationErr = "Lütfen işten ayrılış tarihini seçin.";
  } else if (endDate < startDate) {
    validationErr = "İşten ayrılış tarihi işe giriş tarihinden önce olamaz.";
  } else if (!getKidemTavani(endDate)) {
    validationErr = "Kıdem tazminatı tavanı yalnızca resmî ÇSGB tarihçesi bulunan 2016–2026 yılları arasındaki dönemler için hesaplanabilir.";
  } else if (!grossStr || grossStr.trim() === "") {
    validationErr = "Lütfen aylık giydirilmiş brüt ücretinizi girin.";
  } else if (gross <= 0) {
    validationErr = "Lütfen geçerli bir brüt ücret girin.";
  }

  const activePayloadKey = `${startDate}:${endDate}:${gross}`;

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
        const payload = {
          startDate,
          endDate,
          grossSalary: gross
        };

        const response = await calculateAction(calculator.slug, payload);
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
  }, [mounted, startDate, endDate, gross, calculator.slug, validationErr, activePayloadKey]);

  const isPayloadMatched = resolvedPayloadKey === activePayloadKey;
  const isStale = loading || !isPayloadMatched || validationErr !== null;
  const result = res?.success && isPayloadMatched && !validationErr ? res.data.primaryResult : null;
  const isEligible = result?.isEligible ?? true;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Sol Giriş ve Özet Bölümü */}
      <div className="w-full lg:w-[45%] flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Kıdem Tazminatı</h2>
              <p className="text-sm text-slate-500 mt-1">1475 Sayılı İş Kanunu Md. 14</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* İşe Giriş Tarihi */}
            <div>
              <label htmlFor="kidem-start-date" className="block text-sm font-semibold text-slate-700 mb-2">
                İşe Başlama Tarihi
              </label>
              <div className="relative">
                <input
                  id="kidem-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setStartBadInput(Boolean((e.target as HTMLInputElement).validity?.badInput));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-semibold text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">İşyerinde fiilen çalışmaya başladığınız ilk gün.</p>
            </div>

            {/* İşten Ayrılış Tarihi */}
            <div>
              <label htmlFor="kidem-end-date" className="block text-sm font-semibold text-slate-700 mb-2">
                İşten Ayrılış Tarihi
              </label>
              <div className="relative">
                <input
                  id="kidem-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEndBadInput(Boolean((e.target as HTMLInputElement).validity?.badInput));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    validationErr && (validationErr.includes("ayrılış") || validationErr.includes("dönem"))
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50"
                      : "border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-200"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Kıdem tavanı fesih tarihindeki resmî katsayıya göre belirlenir.
              </p>
            </div>

            {/* Giydirilmiş Aylık Brüt Ücret */}
            <div>
              <label htmlFor="kidem-gross-input" className="block text-sm font-semibold text-slate-700 mb-2">
                Son Giydirilmiş Aylık Brüt Ücret (TL)
              </label>
              <div className="relative">
                <input
                  id="kidem-gross-input"
                  type="text"
                  inputMode="decimal"
                  value={grossStr}
                  onChange={handleGrossChange}
                  onBlur={handleGrossBlur}
                  placeholder="50.000"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all pl-12 ${
                    validationErr && (validationErr.includes("brüt") || validationErr.includes("ücret"))
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 bg-slate-50 hover:bg-white"
                  }`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Temel brüt maaşınıza ek olarak nakdi ve ayni düzenli yan haklar (yemek, yol, yakacak, düzenli ikramiye vb.) dahildir.
              </p>
            </div>

            {validationErr && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationErr}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sonuç Vurgu Kartı */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-indigo-100 font-medium">Net Kıdem Tazminatı</h3>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-white/50" />}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              {isStale ? (
                <div className="h-12 w-48 bg-white/20 animate-pulse rounded-lg my-1" />
              ) : !isEligible ? (
                <div className="text-3xl md:text-4xl font-black tracking-tight text-indigo-100">
                  0,00 <span className="text-xl font-bold text-indigo-200">TL</span>
                </div>
              ) : (
                <div className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm flex items-baseline gap-1">
                  <NumberFlow
                    value={result ? result.netSeverance : 0}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                  />
                  <span className="text-2xl font-bold text-indigo-200">TL</span>
                </div>
              )}
            </div>

            {result?.isCapped && isEligible && !isStale && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 text-xs text-indigo-100 mb-3 border border-white/10">
                <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Brüt ücretiniz tavanı aştığı için hesaplama yasal tavan üzerinden yapılmıştır.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Brüt Tazminat</p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (result ? formatDec(result.grossSeverance) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Damga Vergisi (%0,759)</p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (result ? formatDec(result.stampTax) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Hesap Esas Ücreti</p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (result ? formatDec(result.effectiveBaseSalary) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium mb-1 uppercase tracking-wider">Uygulanan Tavan</p>
                <p className="font-bold text-lg">
                  {isStale ? "—" : (result ? formatDec(result.appliedCeiling) : "0,00")}{" "}
                  <span className="text-sm text-indigo-300">TL</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Detay ve Mevzuat Bölümü */}
      <div className="w-full lg:w-[55%] flex flex-col gap-6">
        {/* Hizmet Süresi ve Kırılım Kartı */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Hizmet Süresi ve Tazminat Kırılımı</span>
          </h3>

          {validationErr ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">{validationErr}</p>
              <p className="text-xs text-slate-400">Sonuçları ve hesaplama dökümünü görmek için geçerli tarih ve ücret girin.</p>
            </div>
          ) : !isEligible ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Kıdem Tazminatına Hak Kazanma Şartı Sağlanamadı</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                Hesaplanan çalışma süreniz: <strong>{result?.servicePeriod?.formattedString || "1 yıldan az"}</strong> ({result?.servicePeriod?.totalDays || 0} takvim günü).
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                1475 sayılı İş Kanunu&apos;nun 14. maddesi gereğince, aynı işverene bağlı olarak kıdem tazminatına hak kazanabilmek için <strong>en az 1 tam yıl (365 gün)</strong> kesintisiz çalışma süresi şarttır.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hizmet Süresi Rozeti */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-0.5">
                    Toplam Hizmet Süresi
                  </span>
                  <span className="text-lg font-bold text-indigo-950">
                    {isStale ? "—" : result?.servicePeriod?.formattedString}
                  </span>
                </div>
                <div className="text-xs text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-100/80 font-medium">
                  {isStale ? "—" : `${result?.servicePeriod?.totalDays} takvim günü`}
                </div>
              </div>

              {/* Süre Kırılım Tablosu */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100 text-xs">
                      <th className="pb-3 font-semibold">Süre Bileşeni</th>
                      <th className="pb-3 font-semibold text-center">Süre</th>
                      <th className="pb-3 font-semibold text-right">Esas Alınan Ücret</th>
                      <th className="pb-3 font-semibold text-right">Brüt Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-700">Tam Yıllar (Yıllık 30 gün)</td>
                      <td className="py-3 text-center text-slate-600">{isStale ? "—" : `${result?.servicePeriod?.years} yıl`}</td>
                      <td className="py-3 text-right text-slate-600">{isStale ? "—" : `${formatDec(result?.effectiveBaseSalary || 0)} TL`}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">{isStale ? "—" : `${formatDec(result?.breakdown?.yearAmount || 0)} TL`}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-700">Artan Aylar (Orantılı)</td>
                      <td className="py-3 text-center text-slate-600">{isStale ? "—" : `${result?.servicePeriod?.months} ay`}</td>
                      <td className="py-3 text-right text-slate-600">{isStale ? "—" : `${formatDec(result?.effectiveBaseSalary || 0)} TL`}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">{isStale ? "—" : `${formatDec(result?.breakdown?.monthAmount || 0)} TL`}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-medium text-slate-700">Artan Günler (Gün / 365)</td>
                      <td className="py-3 text-center text-slate-600">{isStale ? "—" : `${result?.servicePeriod?.days} gün`}</td>
                      <td className="py-3 text-right text-slate-600">{isStale ? "—" : `${formatDec(result?.effectiveBaseSalary || 0)} TL`}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">{isStale ? "—" : `${formatDec(result?.breakdown?.dayAmount || 0)} TL`}</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                      <td colSpan={3} className="py-3 px-2 text-slate-700">Toplam Brüt Kıdem Tazminatı</td>
                      <td className="py-3 text-right text-indigo-700">{isStale ? "—" : `${formatDec(result?.grossSeverance || 0)} TL`}</td>
                    </tr>
                    <tr className="text-slate-600 text-xs">
                      <td colSpan={3} className="py-2.5 px-2 text-slate-500">Yasal Kesinti: Damga Vergisi (Binde 7,59)</td>
                      <td className="py-2.5 text-right text-rose-600 font-semibold">{isStale ? "—" : `- ${formatDec(result?.stampTax || 0)} TL`}</td>
                    </tr>
                    <tr className="bg-indigo-50/50 font-bold text-base border-t border-indigo-100">
                      <td colSpan={3} className="py-3 px-2 text-indigo-950">Ödenecek Net Kıdem Tazminatı</td>
                      <td className="py-3 text-right text-indigo-600">{isStale ? "—" : `${formatDec(result?.netSeverance || 0)} TL`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Resmî Tavan ve Yasal Bilgilendirme Kutuları */}
        <div className="space-y-4">
          {/* Tavan Bilgi Kutusu */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 text-sm">
                Yürürlükteki Resmî Kıdem Tavanı: {result?.tavanInfo?.periodLabel}
              </p>
              <p>
                İşten ayrılış tarihinize ({endDate}) tekabül eden tavan tutarı <strong>{formatDec(result?.appliedCeiling || 64948.77)} TL</strong>&apos;dir.
                Referans: <em>{result?.tavanInfo?.circularRef}</em>.
              </p>
              <a
                href={result?.tavanInfo?.sourceUrl || CSGB_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline mt-1"
              >
                <span>T.C. ÇSGB Ücret ve Sendikal İstatistikler Resmî Tablosu</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Fesih Uyarısı (Disclaimer) */}
          <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200/80 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hukuki Hak Kazanma Uyarısı</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Kıdem tazminatına hak kazanılması; iş sözleşmesinin fesih gerekçesine (işverenin haklı feshi dışındaki fesihler, çalışanın 4857 s.K. m. 24 uyarınca haklı feshi, emeklilik, askerlik, kadın çalışanın evlilikten itibaren 1 yıl içinde ayrılması vb.) bağlıdır.
            </p>
            <p className="font-medium text-amber-800">
              Bu hesaplama aracı hukuki bir hak kazanma kararı veya bağlayıcı bilirkişi raporu teşkil etmez; yalnızca girilen tarihlere ve ücrete göre yasal formül üzerinden simülasyon yapar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

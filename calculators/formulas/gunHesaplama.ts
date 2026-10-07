export function isValidGregorianDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  
  const [y, m, d] = value.split("-").map(Number);
  
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  
  if ((m === 4 || m === 6 || m === 9 || m === 11) && d > 30) return false;
  
  if (m === 2) {
    const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    if (isLeapYear && d > 29) return false;
    if (!isLeapYear && d > 28) return false;
  }
  
  return true;
}

export function calculateDaysBetween(dateStr1: string, dateStr2: string): number {
  if (!isValidGregorianDateString(dateStr1) || !isValidGregorianDateString(dateStr2)) {
    throw new Error("Geçersiz tarih formatı.");
  }
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  
  const d_1 = Date.UTC(y1, m1 - 1, d1);
  const d_2 = Date.UTC(y2, m2 - 1, d2);
  
  return Math.trunc((d_2 - d_1) / 86400000);
}

function formatWeeksAndDays(totalDays: number): string {
  const absDays = Math.abs(totalDays);
  if (absDays < 7) return "";
  const w = Math.floor(absDays / 7);
  const d = absDays % 7;
  
  let res = `${w} hafta`;
  if (d > 0) res += ` ${d} gün`;
  return res;
}

function formatDateToTurkish(dateStr: string): string {
  if (!isValidGregorianDateString(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  
  return `${d} ${months[m - 1]} ${y} ${days[date.getUTCDay()]}`;
}

export function calculateGunHesaplama(input: {
  mode: "kaldi" | "gecti" | "arasi";
  referenceDate?: string;
  targetDate?: string;
  startDate?: string;
  endDate?: string;
}) {
  let mainResult = "";
  let subResult = "";
  let breakDown: any[] = [];
  
  if (input.mode === "kaldi") {
    if (!input.referenceDate || !input.targetDate) throw new Error("Tarihler eksik");
    const diff = calculateDaysBetween(input.referenceDate, input.targetDate);
    
    if (diff === 0) {
      mainResult = "0";
      subResult = "BUGÜN";
    } else if (diff > 0) {
      mainResult = diff.toString();
      subResult = "GÜN KALDI";
      const weeks = formatWeeksAndDays(diff);
      if (weeks) {
        breakDown.push({ label: "Hafta Olarak", value: weeks });
      }
      breakDown.push({ label: "Hedef Tarih", value: formatDateToTurkish(input.targetDate) });
    } else {
      mainResult = Math.abs(diff).toString();
      subResult = "GÜN GEÇTİ";
      const weeks = formatWeeksAndDays(diff);
      if (weeks) {
        breakDown.push({ label: "Hafta Olarak", value: weeks });
      }
      breakDown.push({ label: "Hedef Tarih", value: formatDateToTurkish(input.targetDate) });
    }
  } else if (input.mode === "gecti") {
    if (!input.referenceDate || !input.startDate) throw new Error("Tarihler eksik");
    const diff = calculateDaysBetween(input.startDate, input.referenceDate);
    
    if (diff === 0) {
      mainResult = "0";
      subResult = "BUGÜN";
    } else if (diff > 0) {
      mainResult = diff.toString();
      subResult = "GÜN GEÇTİ";
      const weeks = formatWeeksAndDays(diff);
      if (weeks) {
        breakDown.push({ label: "Hafta Olarak", value: weeks });
      }
      breakDown.push({ label: "Başlangıç Tarihi", value: formatDateToTurkish(input.startDate) });
    } else {
      mainResult = Math.abs(diff).toString();
      subResult = "GÜN KALDI";
      const weeks = formatWeeksAndDays(diff);
      if (weeks) {
        breakDown.push({ label: "Hafta Olarak", value: weeks });
      }
      breakDown.push({ label: "Başlangıç Tarihi", value: formatDateToTurkish(input.startDate) });
    }
  } else if (input.mode === "arasi") {
    if (!input.startDate || !input.endDate) throw new Error("Tarihler eksik");
    const diff = Math.abs(calculateDaysBetween(input.startDate, input.endDate));
    
    mainResult = diff.toString();
    subResult = "GÜN";
    
    const weeks = formatWeeksAndDays(diff);
    if (weeks) {
      breakDown.push({ label: "Hafta Olarak", value: weeks });
    }
    breakDown.push({ label: "Her iki tarih dahil edilirse", value: `${diff + 1} gün` });
    breakDown.push({ label: "Başlangıç", value: formatDateToTurkish(input.startDate) });
    breakDown.push({ label: "Bitiş", value: formatDateToTurkish(input.endDate) });
  }

  return { primaryResult: mainResult, secondaryResults: { subLabel: subResult }, breakdown: breakDown };
}



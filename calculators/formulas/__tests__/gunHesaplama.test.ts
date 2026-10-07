import { describe, it, expect } from "vitest";
import { calculateDaysBetween, calculateGunHesaplama, isValidGregorianDateString } from "../gunHesaplama";

describe("Gün Hesaplama - Validation", () => {
  it("should reject invalid dates", () => {
    expect(isValidGregorianDateString("2026-02-31")).toBe(false);
    expect(isValidGregorianDateString("2025-02-29")).toBe(false);
    expect(isValidGregorianDateString("1900-02-29")).toBe(false);
    expect(isValidGregorianDateString("2026-13-01")).toBe(false);
    expect(isValidGregorianDateString("2026-00-01")).toBe(false);
    expect(isValidGregorianDateString("2026-01-00")).toBe(false);
    expect(isValidGregorianDateString("2026-1-1")).toBe(false);
  });
  
  it("should accept valid dates", () => {
    expect(isValidGregorianDateString("2024-02-29")).toBe(true);
    expect(isValidGregorianDateString("2000-02-29")).toBe(true);
  });
});

describe("Gün Hesaplama - Date Math", () => {
  it("2024-02-28 -> 2024-03-01 = 2", () => {
    expect(calculateDaysBetween("2024-02-28", "2024-03-01")).toBe(2);
  });
  
  it("2025-02-28 -> 2025-03-01 = 1", () => {
    expect(calculateDaysBetween("2025-02-28", "2025-03-01")).toBe(1);
  });

  it("1900-02-28 -> 1900-03-01 = 1", () => {
    expect(calculateDaysBetween("1900-02-28", "1900-03-01")).toBe(1);
  });

  it("2000-02-28 -> 2000-03-01 = 2", () => {
    expect(calculateDaysBetween("2000-02-28", "2000-03-01")).toBe(2);
  });
  
  it("should calculate same day", () => {
    expect(calculateDaysBetween("2026-10-06", "2026-10-06")).toBe(0);
  });
  
  it("should handle year wrap", () => {
    expect(calculateDaysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });
  
  it("should handle negative (reverse) dates", () => {
    expect(calculateDaysBetween("2026-10-10", "2026-10-06")).toBe(-4);
  });
});

describe("Gün Hesaplama - Modes", () => {
  it("Kaç Gün Kaldı - Future", () => {
    const res = calculateGunHesaplama({ mode: "kaldi", referenceDate: "2026-10-06", targetDate: "2026-10-20" });
    expect(res.primaryResult).toBe("14");
    expect(res.secondaryResults.subLabel).toBe("GÜN KALDI");
  });

  it("Kaç Gün Kaldı - Today", () => {
    const res = calculateGunHesaplama({ mode: "kaldi", referenceDate: "2026-10-06", targetDate: "2026-10-06" });
    expect(res.primaryResult).toBe("0");
    expect(res.secondaryResults.subLabel).toBe("BUGÜN");
  });

  it("Kaç Gün Kaldı - Past (should shift to GÜN GEÇTİ)", () => {
    const res = calculateGunHesaplama({ mode: "kaldi", referenceDate: "2026-10-06", targetDate: "2026-10-01" });
    expect(res.primaryResult).toBe("5");
    expect(res.secondaryResults.subLabel).toBe("GÜN GEÇTİ");
  });

  it("Kaç Gün Geçti - Past", () => {
    const res = calculateGunHesaplama({ mode: "gecti", referenceDate: "2026-10-06", startDate: "2026-09-01" });
    expect(res.primaryResult).toBe("35");
    expect(res.secondaryResults.subLabel).toBe("GÜN GEÇTİ");
  });

  it("Kaç Gün Geçti - Future (should shift to GÜN KALDI)", () => {
    const res = calculateGunHesaplama({ mode: "gecti", referenceDate: "2026-10-06", startDate: "2026-10-10" });
    expect(res.primaryResult).toBe("4");
    expect(res.secondaryResults.subLabel).toBe("GÜN KALDI");
  });
  
  it("İki Tarih Arası - Standard & Inclusive", () => {
    const res = calculateGunHesaplama({ mode: "arasi", startDate: "2026-10-06", endDate: "2026-10-07" });
    expect(res.primaryResult).toBe("1");
    expect(res.secondaryResults.subLabel).toBe("GÜN");
    expect(res.breakdown.find(b => b.label === "Her iki tarih dahil edilirse")?.value).toBe("2 gün");
  });

  it("İki Tarih Arası - Reverse (10.10.2026 -> 06.10.2026)", () => {
    const res = calculateGunHesaplama({ mode: "arasi", startDate: "2026-10-10", endDate: "2026-10-06" });
    expect(res.primaryResult).toBe("4");
    expect(res.secondaryResults.subLabel).toBe("GÜN");
    expect(res.breakdown.find(b => b.label === "Her iki tarih dahil edilirse")?.value).toBe("5 gün");
  });

  it("İki Tarih Arası - Same Date", () => {
    const res = calculateGunHesaplama({ mode: "arasi", startDate: "2026-10-06", endDate: "2026-10-06" });
    expect(res.primaryResult).toBe("0");
    expect(res.secondaryResults.subLabel).toBe("GÜN");
    expect(res.breakdown.find(b => b.label === "Her iki tarih dahil edilirse")?.value).toBe("1 gün");
  });
});



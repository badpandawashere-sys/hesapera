// 2026 T.C. Saglik Bakanligi Ulusal Cocukluk Donemi Asilama Takvimi
// Guncelleme: 1 Eylul 2026 (Sucicegi 2. doz 48. ay eklemesi)

export interface VaccineScheduleEntry {
  id: string;
  vaccineName: string;
  targetAgeMonths: number;
  doseNumber: number;
  notes: string;
}

export const VACCINE_SCHEDULE_2026: VaccineScheduleEntry[] = [
  // Dogumda (0. ay)
  { id: 'hepB_1', vaccineName: 'Hepatit B (Hep-B)', targetAgeMonths: 0, doseNumber: 1, notes: 'Doğumda uygulanır.' },
  
  // 1. Ay Sonu
  { id: 'hepB_2', vaccineName: 'Hepatit B (Hep-B)', targetAgeMonths: 1, doseNumber: 2, notes: '1. ayın sonunda uygulanır.' },
  
  // 2. Ay Sonu
  { id: 'bcg_1', vaccineName: 'Verem (BCG)', targetAgeMonths: 2, doseNumber: 1, notes: '2. ayın sonunda uygulanır.' },
  { id: 'dabt_ipa_hib_1', vaccineName: 'Beşli Karma (DaBT-İPA-Hib)', targetAgeMonths: 2, doseNumber: 1, notes: '2. ayın sonunda uygulanır.' },
  { id: 'kpa_1', vaccineName: 'Zatürre (KPA)', targetAgeMonths: 2, doseNumber: 1, notes: '2. ayın sonunda uygulanır.' },
  
  // 4. Ay Sonu
  { id: 'dabt_ipa_hib_2', vaccineName: 'Beşli Karma (DaBT-İPA-Hib)', targetAgeMonths: 4, doseNumber: 2, notes: '4. ayın sonunda uygulanır.' },
  { id: 'kpa_2', vaccineName: 'Zatürre (KPA)', targetAgeMonths: 4, doseNumber: 2, notes: '4. ayın sonunda uygulanır.' },
  
  // 6. Ay Sonu
  { id: 'hepB_3', vaccineName: 'Hepatit B (Hep-B)', targetAgeMonths: 6, doseNumber: 3, notes: '6. ayın sonunda uygulanır.' },
  { id: 'dabt_ipa_hib_3', vaccineName: 'Beşli Karma (DaBT-İPA-Hib)', targetAgeMonths: 6, doseNumber: 3, notes: '6. ayın sonunda uygulanır.' },
  { id: 'opa_1', vaccineName: 'Çocuk Felci (OPA)', targetAgeMonths: 6, doseNumber: 1, notes: '6. ayın sonunda uygulanır (Ağızdan damla).' },
  
  // 12. Ay Sonu
  { id: 'kpa_peki', vaccineName: 'Zatürre (KPA) Pekiştirme', targetAgeMonths: 12, doseNumber: 3, notes: '12. ayın sonunda pekiştirme dozu.' },
  { id: 'kkk_1', vaccineName: 'Kızamık, Kızamıkçık, Kabakulak (KKK)', targetAgeMonths: 12, doseNumber: 1, notes: '12. ayın sonunda uygulanır.' },
  { id: 'sucicegi_1', vaccineName: 'Suçiçeği', targetAgeMonths: 12, doseNumber: 1, notes: '12. ayın sonunda uygulanır.' },
  
  // 18. Ay Sonu
  { id: 'dabt_ipa_hib_peki', vaccineName: 'Beşli Karma (DaBT-İPA-Hib) Pekiştirme', targetAgeMonths: 18, doseNumber: 4, notes: '18. ayın sonunda pekiştirme dozu.' },
  { id: 'opa_2', vaccineName: 'Çocuk Felci (OPA)', targetAgeMonths: 18, doseNumber: 2, notes: '18. ayın sonunda uygulanır (Ağızdan damla).' },
  { id: 'hepA_1', vaccineName: 'Hepatit A', targetAgeMonths: 18, doseNumber: 1, notes: '18. ayın sonunda uygulanır.' },
  
  // 24. Ay Sonu
  { id: 'hepA_2', vaccineName: 'Hepatit A', targetAgeMonths: 24, doseNumber: 2, notes: '24. ayın sonunda uygulanır.' },
  
  // 48. Ay Sonu
  { id: 'kkk_2', vaccineName: 'Kızamık, Kızamıkçık, Kabakulak (KKK)', targetAgeMonths: 48, doseNumber: 2, notes: '48. ayda uygulanır.' },
  { id: 'dabt_ipa', vaccineName: 'Dörtlü Karma (DaBT-İPA)', targetAgeMonths: 48, doseNumber: 1, notes: '48. ayda pekiştirme dozu.' },
  { id: 'sucicegi_2', vaccineName: 'Suçiçeği', targetAgeMonths: 48, doseNumber: 2, notes: '1 Eylül 2026 itibarıyla Ulusal Aşı Takvimine eklenen 2. dozdur.' }
];

export function getVaccinesForAge(ageInMonths: number): VaccineScheduleEntry[] {
  return VACCINE_SCHEDULE_2026.filter(v => v.targetAgeMonths === ageInMonths);
}

export function getAllVaccines(): VaccineScheduleEntry[] {
  return VACCINE_SCHEDULE_2026;
}

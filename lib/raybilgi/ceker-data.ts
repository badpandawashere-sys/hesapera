// GENERATED DATA - DO NOT AUTO REVERSE
// Station lists explicitly defined for both directions

export const ROUTE_ESKISEHIR_HALKALI = [
  "ESKİŞEHİR",
  "ENVERİYE",
  "KARAGÖZLER",
  "ÇUKURHİSAR",
  "İNÖNÜ",
  "BOZÜYÜK",
  "AYVALI",
  "KARAKÖY",
  "KM 222+399",
  "KM 221+401",
  "YAYLA",
  "KM 238+250",
  "KM.277+500",
  "BİLECİK",
  "PELİTÖZÜ",
  "VEZİRHAN",
  "BAYIRKÖY",
  "SARMAŞIK",
  "OSMANELİ",
  "MEKECE",
  "HAYRETTİN",
  "PAMUKOVA",
  "ALİFUATPAŞA",
  "DOĞANÇAY",
  "ARİFİYE",
  "SAPANCA",
  "KM 123+400",
  "BÜYÜKDERBENT",
  "TEPETARLA",
  "KM 98+382",
  "KÖSEKÖY",
  "KM 90+852 / İZMİT DOĞU",
  "İZMİT",
  "DERİNCE",
  "YARIMCA",
  "KÖRFEZ",
  "HEREKE",
  "MUALLİMKÖY",
  "KM 45+492",
  "GEBZE DEPO",
  "GEBZE",
  "ÇAYIROVA",
  "TUZLA",
  "TERSANE",
  "PENDİK",
  "YUNUS",
  "ATALAR",
  "MALTEPE SAYDING",
  "BOSTANCI",
  "ERENKÖY",
  "SÖĞÜTLÜÇEŞME",
  "KM 44+471 AS04",
  "KM 44+558 AS03",
  "KM 44+679 AS01",
  "KM 58+957 EU100",
  "KM 59+108 EU103",
  "KM 59+220 EU103",
  "ZEYTİNBURNU FİŞEKHANE",
  "ATAKÖY",
  "YEŞİLKÖY",
  "HALKALI"
];

export const ROUTE_HALKALI_ESKISEHIR = [
  "HALKALI",
  "YEŞİLKÖY",
  "ATAKÖY",
  "ZEYTİNBURNU FİŞEKHANE",
  "KM 59+220 EU103",
  "KM 59+108 EU103",
  "KM 58+957 EU100",
  "KM 44+679 AS01",
  "KM 44+558 AS03",
  "KM 44+471 AS04",
  "SÖĞÜTLÜÇEŞME",
  "ERENKÖY",
  "BOSTANCI",
  "MALTEPE SAYDING",
  "ATALAR",
  "YUNUS",
  "PENDİK",
  "TERSANE",
  "TUZLA",
  "ÇAYIROVA",
  "GEBZE",
  "GEBZE DEPO",
  "KM 45+492",
  "MUALLİMKÖY",
  "HEREKE",
  "KÖRFEZ",
  "YARIMCA",
  "DERİNCE",
  "İZMİT",
  "KM 90+852 / İZMİT DOĞU",
  "KÖSEKÖY",
  "KM 98+382",
  "TEPETARLA",
  "BÜYÜKDERBENT",
  "KM 123+400",
  "SAPANCA",
  "ARİFİYE",
  "DOĞANÇAY",
  "ALİFUATPAŞA",
  "PAMUKOVA",
  "HAYRETTİN",
  "MEKECE",
  "OSMANELİ",
  "SARMAŞIK",
  "BAYIRKÖY",
  "VEZİRHAN",
  "PELİTÖZÜ",
  "BİLECİK",
  "KM.277+500",
  "KM 238+250",
  "YAYLA",
  "KM 221+401",
  "KM 222+399",
  "KARAKÖY",
  "AYVALI",
  "BOZÜYÜK",
  "İNÖNÜ",
  "ÇUKURHİSAR",
  "KARAGÖZLER",
  "ENVERİYE",
  "ESKİŞEHİR"
];

export type LocoType = 'de22000' | 'de24000' | 'de33000' | 'de36000' | 'e43000' | 'e68000' | 'e68000_m' | 'hb83000_dizel' | 'hb83000_elektrik' | 'e76000' | 'e5000' | 'ton_100' | 'ton_150' | 'ton_350';

export interface CekerEdge {
  from: string;
  to: string;
  limits: Record<LocoType, number>;
}

// WEST direction macro edges (Eskişehir -> Halkalı direction)
export const CEKER_EDGES_WEST: CekerEdge[] = [
  {
    "from": "ESKİŞEHİR",
    "to": "İNÖNÜ",
    "limits": {
      "de22000": 2000,
      "de24000": 2000,
      "de33000": 2500,
      "de36000": 2500,
      "e43000": 2500,
      "e68000": 2250,
      "e68000_m": 2500,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2500,
      "e5000": 2500,
      "ton_100": 2260,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "İNÖNÜ",
    "to": "KM.277+500",
    "limits": {
      "de22000": 1420,
      "de24000": 1100,
      "de33000": 1900,
      "de36000": 2300,
      "e43000": 1720,
      "e68000": 1570,
      "e68000_m": 1780,
      "hb83000_dizel": 2350,
      "hb83000_elektrik": 2350,
      "e76000": 1870,
      "e5000": 1600,
      "ton_100": 1850,
      "ton_150": 2940,
      "ton_350": 4000
    }
  },
  {
    "from": "KM.277+500",
    "to": "BİLECİK",
    "limits": {
      "de22000": 2000,
      "de24000": 2000,
      "de33000": 2500,
      "de36000": 2500,
      "e43000": 2500,
      "e68000": 2250,
      "e68000_m": 2500,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2500,
      "e5000": 2500,
      "ton_100": 2500,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "BİLECİK",
    "to": "DERİNCE",
    "limits": {
      "de22000": 1700,
      "de24000": 1355,
      "de33000": 2340,
      "de36000": 2500,
      "e43000": 2500,
      "e68000": 2250,
      "e68000_m": 2500,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2500,
      "e5000": 2500,
      "ton_100": 1970,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "DERİNCE",
    "to": "GEBZE",
    "limits": {
      "de22000": 1700,
      "de24000": 1355,
      "de33000": 2340,
      "de36000": 2500,
      "e43000": 2040,
      "e68000": 1850,
      "e68000_m": 2080,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2250,
      "e5000": 1890,
      "ton_100": 2320,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "GEBZE",
    "to": "HALKALI",
    "limits": {
      "de22000": 1150,
      "de24000": 900,
      "de33000": 1400,
      "de36000": 1900,
      "e43000": 1450,
      "e68000": 1330,
      "e68000_m": 1500,
      "hb83000_dizel": 2000,
      "hb83000_elektrik": 2000,
      "e76000": 1540,
      "e5000": 1350,
      "ton_100": 1510,
      "ton_150": 2400,
      "ton_350": 4000
    }
  }
];

// EAST direction macro edges (Halkalı -> Eskişehir direction)
export const CEKER_EDGES_EAST: CekerEdge[] = [
  {
    "from": "HALKALI",
    "to": "GEBZE",
    "limits": {
      "de22000": 1010,
      "de24000": 780,
      "de33000": 1230,
      "de36000": 1660,
      "e43000": 1280,
      "e68000": 1180,
      "e68000_m": 1330,
      "hb83000_dizel": 1780,
      "hb83000_elektrik": 1780,
      "e76000": 1350,
      "e5000": 1190,
      "ton_100": 1460,
      "ton_150": 2320,
      "ton_350": 4000
    }
  },
  {
    "from": "GEBZE",
    "to": "DERİNCE",
    "limits": {
      "de22000": 1950,
      "de24000": 1625,
      "de33000": 2500,
      "de36000": 2500,
      "e43000": 2500,
      "e68000": 2250,
      "e68000_m": 2500,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2500,
      "e5000": 2500,
      "ton_100": 2500,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "DERİNCE",
    "to": "ARİFİYE",
    "limits": {
      "de22000": 1700,
      "de24000": 1355,
      "de33000": 2340,
      "de36000": 2500,
      "e43000": 2000,
      "e68000": 1820,
      "e68000_m": 2050,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2210,
      "e5000": 1860,
      "ton_100": 2180,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "ARİFİYE",
    "to": "VEZİRHAN",
    "limits": {
      "de22000": 1400,
      "de24000": 1090,
      "de33000": 1890,
      "de36000": 2500,
      "e43000": 2490,
      "e68000": 2240,
      "e68000_m": 2500,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2500,
      "e5000": 2300,
      "ton_100": 2060,
      "ton_150": 3000,
      "ton_350": 4000
    }
  },
  {
    "from": "VEZİRHAN",
    "to": "BİLECİK",
    "limits": {
      "de22000": 1200,
      "de24000": 930,
      "de33000": 1600,
      "de36000": 1800,
      "e43000": 1370,
      "e68000": 1270,
      "e68000_m": 1430,
      "hb83000_dizel": 1910,
      "hb83000_elektrik": 1910,
      "e76000": 1450,
      "e5000": 1280,
      "ton_100": 1640,
      "ton_150": 2620,
      "ton_350": 4000
    }
  },
  {
    "from": "BİLECİK",
    "to": "KARAKÖY",
    "limits": {
      "de22000": 650,
      "de24000": 500,
      "de33000": 790,
      "de36000": 1030,
      "e43000": 810,
      "e68000": 760,
      "e68000_m": 860,
      "hb83000_dizel": 1170,
      "hb83000_elektrik": 1170,
      "e76000": 820,
      "e5000": 760,
      "ton_100": 1070,
      "ton_150": 1700,
      "ton_350": 3790
    }
  },
  {
    "from": "KARAKÖY",
    "to": "İNÖNÜ",
    "limits": {
      "de22000": 1240,
      "de24000": 950,
      "de33000": 1450,
      "de36000": 1890,
      "e43000": 1440,
      "e68000": 1320,
      "e68000_m": 1500,
      "hb83000_dizel": 1990,
      "hb83000_elektrik": 1990,
      "e76000": 1530,
      "e5000": 1340,
      "ton_100": 1730,
      "ton_150": 2760,
      "ton_350": 4000
    }
  },
  {
    "from": "İNÖNÜ",
    "to": "ESKİŞEHİR",
    "limits": {
      "de22000": 2000,
      "de24000": 2000,
      "de33000": 2500,
      "de36000": 2500,
      "e43000": 2500,
      "e68000": 2250,
      "e68000_m": 2500,
      "hb83000_dizel": 2500,
      "hb83000_elektrik": 2500,
      "e76000": 2500,
      "e5000": 2500,
      "ton_100": 2500,
      "ton_150": 3000,
      "ton_350": 4000
    }
  }
];

// Order should match the source exactly as extracted:
// ['de22000', 'de24000', 'de33000', 'de36000', 'e43000', 'e68000', 'e68000_m', 'hb83000_dizel', 'hb83000_elektrik', 'e76000', 'e5000', 'ton_100', 'ton_150', 'ton_350']
export const CEKER_LOCOMOTIVES: { id: LocoType; label: string }[] = [
  { id: 'de22000', label: 'DE 22000' },
  { id: 'de24000', label: 'DE 24000' },
  { id: 'de33000', label: 'DE 33000' },
  { id: 'de36000', label: 'DE 36000' },
  { id: 'e43000', label: 'E 43000' },
  { id: 'e68000', label: 'E 68000' },
  { id: 'e68000_m', label: 'E 68000 M' },
  { id: 'hb83000_dizel', label: 'HB 83000 (Dizel)' },
  { id: 'hb83000_elektrik', label: 'HB 83000 (Elektrik)' },
  { id: 'e76000', label: 'E 76000' },
  { id: 'e5000', label: 'E 5000' },
  { id: 'ton_100', label: '100 Ton' },
  { id: 'ton_150', label: '150 Ton' },
  { id: 'ton_350', label: '350 Ton' }
];

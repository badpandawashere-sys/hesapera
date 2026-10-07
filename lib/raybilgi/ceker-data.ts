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

export type LocoType = 'DE22000' | 'DE24000' | 'DE33000' | 'E5000' | 'E68000';

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
      "DE22000": 2000,
      "DE24000": 2000,
      "DE33000": 2500,
      "E5000": 2500,
      "E68000": 2250
    }
  },
  {
    "from": "İNÖNÜ",
    "to": "KM.277+500",
    "limits": {
      "DE22000": 1420,
      "DE24000": 1100,
      "DE33000": 1900,
      "E5000": 1600,
      "E68000": 1570
    }
  },
  {
    "from": "KM.277+500",
    "to": "BİLECİK",
    "limits": {
      "DE22000": 2000,
      "DE24000": 2000,
      "DE33000": 2500,
      "E5000": 2500,
      "E68000": 2250
    }
  },
  {
    "from": "BİLECİK",
    "to": "DERİNCE",
    "limits": {
      "DE22000": 1700,
      "DE24000": 1355,
      "DE33000": 2340,
      "E5000": 2500,
      "E68000": 2250
    }
  },
  {
    "from": "DERİNCE",
    "to": "GEBZE",
    "limits": {
      "DE22000": 1700,
      "DE24000": 1355,
      "DE33000": 2340,
      "E5000": 1890,
      "E68000": 1850
    }
  },
  {
    "from": "GEBZE",
    "to": "HALKALI",
    "limits": {
      "DE22000": 1150,
      "DE24000": 900,
      "DE33000": 1400,
      "E5000": 1350,
      "E68000": 1330
    }
  }
];

// EAST direction macro edges (Halkalı -> Eskişehir direction)
export const CEKER_EDGES_EAST: CekerEdge[] = [
  {
    "from": "HALKALI",
    "to": "GEBZE",
    "limits": {
      "DE22000": 1010,
      "DE24000": 780,
      "DE33000": 1230,
      "E5000": 1190,
      "E68000": 1180
    }
  },
  {
    "from": "GEBZE",
    "to": "DERİNCE",
    "limits": {
      "DE22000": 1950,
      "DE24000": 1625,
      "DE33000": 2500,
      "E5000": 2500,
      "E68000": 2250
    }
  },
  {
    "from": "DERİNCE",
    "to": "ARİFİYE",
    "limits": {
      "DE22000": 1700,
      "DE24000": 1355,
      "DE33000": 2340,
      "E5000": 1860,
      "E68000": 1820
    }
  },
  {
    "from": "ARİFİYE",
    "to": "VEZİRHAN",
    "limits": {
      "DE22000": 1400,
      "DE24000": 1090,
      "DE33000": 1890,
      "E5000": 2300,
      "E68000": 2240
    }
  },
  {
    "from": "VEZİRHAN",
    "to": "BİLECİK",
    "limits": {
      "DE22000": 1200,
      "DE24000": 930,
      "DE33000": 1600,
      "E5000": 1280,
      "E68000": 1270
    }
  },
  {
    "from": "BİLECİK",
    "to": "KARAKÖY",
    "limits": {
      "DE22000": 650,
      "DE24000": 500,
      "DE33000": 790,
      "E5000": 760,
      "E68000": 760
    }
  },
  {
    "from": "KARAKÖY",
    "to": "İNÖNÜ",
    "limits": {
      "DE22000": 1240,
      "DE24000": 950,
      "DE33000": 1450,
      "E5000": 1340,
      "E68000": 1320
    }
  },
  {
    "from": "İNÖNÜ",
    "to": "ESKİŞEHİR",
    "limits": {
      "DE22000": 2000,
      "DE24000": 2000,
      "DE33000": 2500,
      "E5000": 2500,
      "E68000": 2250
    }
  }
];

export const CEKER_LOCOMOTIVES: { id: LocoType; label: string }[] = [
  { id: 'DE22000', label: 'DE 22000' },
  { id: 'DE24000', label: 'DE 24000' },
  { id: 'DE33000', label: 'DE 33000' },
  { id: 'E5000', label: 'E 5000' },
  { id: 'E68000', label: 'E 68000' }
];
